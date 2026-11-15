#ifndef NATIVE_GET_GIT
#define NATIVE_GET_GIT

#include "common.hpp"

struct get_git_work
{
	uv_work_t handle;

	v8::Global<v8::Promise::Resolver> promise;

	std::filesystem::path abst; // generic_path
	std::filesystem::path base; // generic_path
	int32_t dp;
	_string_t pt;
	std::filesystem::path wdir; // generic_path
	std::basic_string<char> brch;
	std::vector<std::pair<std::filesystem::path, unsigned int>> v; // generic_path, git
};

static void get_git(get_git_work* work, const std::filesystem::path& wd, int32_t dp, _git* git, unsigned int inherit)
{
	try {
		std::vector<std::filesystem::path> list; // generic_path

		std::error_code ec;
		std::for_each(std::filesystem::directory_iterator(wd, ec), std::filesystem::directory_iterator(),
			[&list](const std::filesystem::path& path)
			{
				list.push_back(generic_path(path));
			}
		);

		std::for_each(list.begin(), list.end(),
			[&](const std::filesystem::path& path)
			{
				_attribute attr = {};
				attr.full = path;
				if (inherit) {
					attribute(attr);
					attr.git |= inherit;
				}
				else {
					attribute(attr, git);
				}

				if (work->pt.empty() || std::regex_search(generic_path(attr.full.lexically_relative(work->abst)).c_str(), _regex_t(work->pt))) {
					work->v.push_back({ attr.full, attr.git });
				}

				if (attr.file_type == FILE_TYPE::FILE_TYPE_DIRECTORY) {
					if (dp < work->dp) {
						const bool submodule = attr.git & GIT_FM_SUBMODULE;
						get_git(work, attr.full, dp + 1, submodule ? nullptr : git, submodule ? 0 : (attr.git & (GIT_IGNORED | GIT_INTERNAL)));
					}
				}
			}
		);
	}
	catch (...) {
	}
}

static void get_git_async(uv_work_t* req)
{
	get_git_work* work = static_cast<get_git_work*>(req->data);

	git_repository* repo = nullptr;
	git_index* index = nullptr;
	std::filesystem::path workdir; // generic_path

	std::error_code ec;
	const std::filesystem::path canonical = std::filesystem::canonical(work->abst, ec);
	if (!ec && work->abst == generic_path(canonical) && !git_repository_open_ext(&repo, U8(work->abst), 0, nullptr)) {
		const char* path = git_repository_workdir(repo);
		if (path) {
			workdir = generic_path(path);
			git_repository_index(&index, repo);
		}
	}

	if (repo && index && !workdir.empty()) {
		work->wdir = workdir;

		git_reference* head = nullptr;
		const int head_result = git_repository_head(&head, repo);
		if (head_result == 0) {
			const char* branch = git_reference_name(head);
			if (branch) {
				work->brch = std::basic_string<char>(branch);
			}
		}
		else if (head_result == GIT_EUNBORNBRANCH) {
			git_reference* symbolic = nullptr;
			if (!git_reference_lookup(&symbolic, repo, "HEAD")) {
				const char* target = git_reference_symbolic_target(symbolic);
				if (target) {
					work->brch = std::basic_string<char>(target);
				}
			}
			git_reference_free(symbolic);
		}
		git_reference_free(head);

		_git git = {};
		unsigned int inherit = 0;
		if (compare_path(1, generic_path(work->abst.lexically_relative(workdir)), ".git")) {
			inherit = GIT_INTERNAL;
		}
		else {
			git.repo = repo;
			git.index = index;
			git.workdir = workdir;
			git_load_status(git, work->abst);
		}

		get_git(work, work->abst, 0, git.repo ? &git : nullptr, inherit);
	}

	git_index_free(index);
	git_repository_free(repo);
}

static void get_git_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	get_git_work* work = static_cast<get_git_work*>(req->data);

	v8::Local<v8::Object> list = v8::Object::New(ISOLATE, v8::Null(ISOLATE), nullptr, nullptr, 0);
	for (const auto& [full, git] : work->v) {
		list->CreateDataProperty(
			CONTEXT,
			work->base.empty()
				? to_string(full)
				: to_string(generic_path(full.lexically_relative(work->base))),
			v8::Number::New(ISOLATE, (double)git)
		);
	}

	v8::Local<v8::Object> obj = v8::Object::New(ISOLATE);
	obj->Set(CONTEXT, to_string(V("wdir")), to_string(work->wdir));
	obj->Set(CONTEXT, to_string(V("brch")), to_string(work->brch));
	obj->Set(CONTEXT, to_string(V("status")), list);

	work->promise.Get(ISOLATE)->Resolve(CONTEXT, obj);

	delete work;
}

void get_git(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 4
			|| !info[0]->IsString()
			|| !info[1]->IsString()
			|| !info[2]->IsInt32()
			|| !(info[3]->IsNull() || info[3]->IsRegExp()))
	{
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	get_git_work* work = new get_git_work();
	work->handle.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->abst = generic_path(to_string<_char_t>(info[0].As<v8::String>()));
	if (is_relative(work->abst) || is_traversal(work->abst)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}

	work->base = generic_path(to_string<_char_t>(info[1].As<v8::String>()));
	if (!work->base.empty() && (is_relative(work->base) || is_traversal(work->base))) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}

	work->dp = info[2].As<v8::Int32>()->Value();
	if (work->dp < 0 || 100 < work->dp) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		delete work;
		return;
	}

	if (info[3]->IsNull()) {
		work->pt = V("");
	}
	else if (info[3]->IsRegExp()) {
		work->pt = to_string<_char_t>(info[3].As<v8::RegExp>()->GetSource());
	}

	work->wdir.clear();
	work->brch.clear();
	work->v.clear();

	uv_queue_work(uv_default_loop(), &work->handle, get_git_async, get_git_complete);
}

#endif // include guard
