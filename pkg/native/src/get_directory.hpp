#ifndef NATIVE_GET_DIRECTORY
#define NATIVE_GET_DIRECTORY

#include "common.hpp"

struct get_directory_work
{
	uv_work_t handle;

	v8::Global<v8::Promise::Resolver> promise;

	std::filesystem::path abst; // generic_path
	std::filesystem::path base; // generic_path
	int32_t st; 
	int32_t dp;
	_string_t pt;
	std::vector<_attribute> v;
	int64_t s; // size
	int32_t d; // directory count
	int32_t f; // file count
	int32_t e; // error count

	std::filesystem::path git_workdir; // generic_path
	std::basic_string<char> git_branch;
};

static void get_directory(get_directory_work* work, const std::filesystem::path& wd, int32_t dp, _git* git, unsigned int inherit)
{
	try {
		std::vector<std::filesystem::path> sort; // generic_path

		std::error_code ec;
		std::for_each(std::filesystem::directory_iterator(wd, ec), std::filesystem::directory_iterator(),
			[&sort](const std::filesystem::path& path)
			{
				sort.push_back(generic_path(path));
			}
		);
		if (ec) {
			work->e++;
		}

		std::sort(sort.begin(), sort.end(),
			[](const std::filesystem::path& a, const std::filesystem::path& b)
			{
				return a < b;
			}
		);

		std::for_each(sort.begin(), sort.end(),
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

				if (work->st == SORT_DEPTH_FIRST && (work->pt.empty() || std::regex_search(generic_path(attr.full.lexically_relative(work->abst)).c_str(), _regex_t(work->pt)))) {
					work->v.push_back(attr);
				}

				if (attr.file_type == FILE_TYPE::FILE_TYPE_DIRECTORY) {
					if (dp < work->dp) {
						const bool submodule = attr.git & GIT_FM_SUBMODULE;
						get_directory(work, attr.full, dp + 1, submodule ? nullptr : git, submodule ? 0 : (attr.git & (GIT_IGNORED | GIT_INTERNAL)));
					}
				}

				if (work->st == SORT_SHALLOW_FIRST && (work->pt.empty() || std::regex_search(generic_path(attr.full.lexically_relative(work->abst)).c_str(), _regex_t(work->pt)))) {
					work->v.push_back(attr);
				}
			}
		);
	}
	catch (...) {
		work->e++;
	}
}

static void get_directory_async(uv_work_t* req)
{
	get_directory_work* work = static_cast<get_directory_work*>(req->data);

	git_repository* repo = nullptr;
	git_reference* head = nullptr;
	git_index* index = nullptr;

	std::error_code ec;
	const std::filesystem::path canonical = std::filesystem::canonical(work->abst, ec);
	if (!ec && work->abst == generic_path(canonical) && !git_repository_open_ext(&repo, U8(work->abst), 0, nullptr)) {
		const char* workdir = git_repository_workdir(repo);
		if (workdir) {
			work->git_workdir = generic_path(workdir);
		}

		if (workdir && !git_repository_head(&head, repo)) {
			const char* branch = git_reference_shorthand(head);
			if (branch) {
				work->git_branch = std::basic_string<char>(branch);
			}
		}

		if (workdir) {
			git_repository_index(&index, repo);
		}
	}

	_git git = {};
	unsigned int inherit = 0;
	if (repo && index && !work->git_workdir.empty()) {
		if (compare_path(1, generic_path(work->abst.lexically_relative(work->git_workdir)), ".git")) {
			inherit = GIT_INTERNAL;
		}
		else {
			git.repo = repo;
			git.index = index;
			git.workdir = work->git_workdir;
			git_load_status(git, work->abst);
		}
	}

	get_directory(work, work->abst, 0, git.repo ? &git : nullptr, inherit);

	git_index_free(index);
	git_reference_free(head);
	git_repository_free(repo);

	for (_attribute& attr : work->v) {
		if (attr.file_type == FILE_TYPE::FILE_TYPE_DIRECTORY) {
			work->d++;
		}
		else {
			work->s += attr.size;
			work->f++;
		}
	}
}

static void get_directory_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	get_directory_work* work = static_cast<get_directory_work*>(req->data);

	bool git = !work->git_workdir.empty();

	v8::Local<v8::Object> array = v8::Array::New(ISOLATE);
	uint32_t index = 0;
	for (_attribute& attr : work->v) {
		v8::Local<v8::Object> obj = v8::Object::New(ISOLATE);
		obj->Set(CONTEXT, to_string(V("type")), v8::Number::New(ISOLATE, (double)attr.file_type));
		obj->Set(CONTEXT, to_string(V("rltv")),
			work->base.empty()
				? to_string(attr.full)
				: to_string(generic_path(attr.full.lexically_relative(work->base)))
		);
		if (git) {
			obj->Set(CONTEXT, to_string(V("git")), v8::Number::New(ISOLATE, (double)attr.git));
		}
		array->Set(CONTEXT, index++, obj);
	}

	v8::Local<v8::Object> obj = v8::Object::New(ISOLATE);
	obj->Set(CONTEXT, to_string(V("full")), to_string(work->abst));
	obj->Set(CONTEXT, to_string(V("base")), to_string(work->base));
	obj->Set(CONTEXT, to_string(V("list")), array);
	obj->Set(CONTEXT, to_string(V("s")), v8::BigInt::New(ISOLATE, work->s));
	obj->Set(CONTEXT, to_string(V("d")), v8::Number::New(ISOLATE, (double)work->d));
	obj->Set(CONTEXT, to_string(V("f")), v8::Number::New(ISOLATE, (double)work->f));
	obj->Set(CONTEXT, to_string(V("e")), v8::Number::New(ISOLATE, (double)work->e));

	if (git) {
		v8::Local<v8::Object> g = v8::Object::New(ISOLATE);
		g->Set(CONTEXT, to_string(V("wdir")), to_string(work->git_workdir));
		g->Set(CONTEXT, to_string(V("brch")), to_string(work->git_branch));
		obj->Set(CONTEXT, to_string(V("git")), g);
	}

	work->promise.Get(ISOLATE)->Resolve(CONTEXT, obj);

	delete work;
}

void get_directory(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 5
			|| !info[0]->IsString()
			|| !info[1]->IsString()
			|| !info[2]->IsInt32()
			|| !info[3]->IsInt32()
			|| !(info[4]->IsNull() || info[4]->IsRegExp()))
	{
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	get_directory_work* work = new get_directory_work();
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

	work->st = info[2].As<v8::Int32>()->Value();
	if (work->st != SORT_DEPTH_FIRST && work->st != SORT_SHALLOW_FIRST) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		delete work;
		return;
	}

	work->dp = info[3].As<v8::Int32>()->Value();
	if (work->dp < 0 || 100 < work->dp) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		delete work;
		return;
	}

	if (info[4]->IsNull()) {
		work->pt = V("");
	}
	else if (info[4]->IsRegExp()) {
		work->pt = to_string<_char_t>(info[4].As<v8::RegExp>()->GetSource());
	}

	work->v.clear();

	work->s = 0;
	work->d = 0;
	work->f = 0;
	work->e = 0;

	work->git_workdir.clear();
	work->git_branch.clear();

	uv_queue_work(uv_default_loop(), &work->handle, get_directory_async, get_directory_complete);
}

#endif // include guard
