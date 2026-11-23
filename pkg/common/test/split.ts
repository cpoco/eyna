// node test/split.ts

import assert from "node:assert"
import * as Common from "../index.ts"

{
	const ret = Common.split([], "")
	assert.deepStrictEqual(ret, [])
}
{
	const ret = Common.split([""], "")
	assert.deepStrictEqual(ret, [])
}
{
	const ret = Common.split(["", ""], "")
	assert.deepStrictEqual(ret, [])
}
{
	const ret = Common.split(["abc"], "")
	assert.deepStrictEqual(ret, ["a", "", "b", "", "c"])
}
{
	const ret = Common.split(["abc", ""], "")
	assert.deepStrictEqual(ret, ["a", "", "b", "", "c"])
}
{
	const ret = Common.split(["", "abc"], "")
	assert.deepStrictEqual(ret, ["a", "", "b", "", "c"])
}
{
	const ret = Common.split(["abc", "def"], "")
	assert.deepStrictEqual(ret, ["a", "", "b", "", "c", "d", "", "e", "", "f"])
}

{
	const ret = Common.split([], ",")
	assert.deepStrictEqual(ret, [])
}
{
	const ret = Common.split([""], ",")
	assert.deepStrictEqual(ret, [])
}
{
	const ret = Common.split(["", ""], ",")
	assert.deepStrictEqual(ret, [])
}
{
	const ret = Common.split([",,,"], ",")
	assert.deepStrictEqual(ret, [",", ",", ","])
}
{
	const ret = Common.split(["abc"], ",")
	assert.deepStrictEqual(ret, ["abc"])
}
{
	const ret = Common.split(["", "abc"], ",")
	assert.deepStrictEqual(ret, ["abc"])
}
{
	const ret = Common.split(["abc", ""], ",")
	assert.deepStrictEqual(ret, ["abc"])
}
{
	const ret = Common.split(["aa,bb,cc"], ",")
	assert.deepStrictEqual(ret, ["aa", ",", "bb", ",", "cc"])
}
{
	const ret = Common.split([",aa,bb,cc,"], ",")
	assert.deepStrictEqual(ret, [",", "aa", ",", "bb", ",", "cc", ","])
}
{
	const ret = Common.split([",,aa,,bb,,cc,,"], ",")
	assert.deepStrictEqual(ret, [",", ",", "aa", ",", ",", "bb", ",", ",", "cc", ",", ","])
}
{
	const ret = Common.split(["aa,bb,cc", "dd,ee,ff"], ",")
	assert.deepStrictEqual(ret, ["aa", ",", "bb", ",", "cc", "dd", ",", "ee", ",", "ff"])
}
{
	const ret = Common.split([",aa,bb,cc,", ",dd,ee,ff,"], ",")
	assert.deepStrictEqual(ret, [",", "aa", ",", "bb", ",", "cc", ",", ",", "dd", ",", "ee", ",", "ff", ","])
}
{
	const ret = Common.split([",,aa,,bb,,", ",,cc,,dd,,"], ",")
	assert.deepStrictEqual(ret, [",", ",", "aa", ",", ",", "bb", ",", ",", ",", ",", "cc", ",", ",", "dd", ",", ","])
}

{
	const ret = Common.split([",aa,bb,cc,", ",dd,ee,ff,"], ",,")
	assert.deepStrictEqual(ret, [",aa,bb,cc,", ",dd,ee,ff,"])
}
{
	const ret = Common.split([",,aa,,bb,,", ",,cc,,dd,,"], ",,")
	assert.deepStrictEqual(ret, [",,", "aa", ",,", "bb", ",,", ",,", "cc", ",,", "dd", ",,"])
}
{
	const ret = Common.split([",,,aa,,,bb,,,", ",,,cc,,,dd,,,"], ",,")
	assert.deepStrictEqual(ret, [",,", ",aa", ",,", ",bb", ",,", ",", ",,", ",cc", ",,", ",dd", ",,", ","])
}

{
	const ret = Common.split(["a", "b"], "ab")
	assert.deepStrictEqual(ret, ["a", "b"])
}

{
	const ret = Common.split(["a"], "aa")
	assert.deepStrictEqual(ret, ["a"])
}
{
	const ret = Common.split(["aa"], "aa")
	assert.deepStrictEqual(ret, ["aa"])
}
{
	const ret = Common.split(["aaa"], "aa")
	assert.deepStrictEqual(ret, ["aa", "a"])
}
{
	const ret = Common.split(["aaaa"], "aa")
	assert.deepStrictEqual(ret, ["aa", "aa"])
}
{
	const ret = Common.split(["aaaaa"], "aa")
	assert.deepStrictEqual(ret, ["aa", "aa", "a"])
}
{
	const ret = Common.split(["aaaaaa"], "aa")
	assert.deepStrictEqual(ret, ["aa", "aa", "aa"])
}
{
	const ret = Common.split(["aaaaaaa"], "aa")
	assert.deepStrictEqual(ret, ["aa", "aa", "aa", "a"])
}

{
	const ret = Common.split(["a"], "aaa")
	assert.deepStrictEqual(ret, ["a"])
}
{
	const ret = Common.split(["aa"], "aaa")
	assert.deepStrictEqual(ret, ["aa"])
}
{
	const ret = Common.split(["aaa"], "aaa")
	assert.deepStrictEqual(ret, ["aaa"])
}
{
	const ret = Common.split(["aaaa"], "aaa")
	assert.deepStrictEqual(ret, ["aaa", "a"])
}
{
	const ret = Common.split(["aaaaa"], "aaa")
	assert.deepStrictEqual(ret, ["aaa", "aa"])
}
{
	const ret = Common.split(["aaaaaa"], "aaa")
	assert.deepStrictEqual(ret, ["aaa", "aaa"])
}
{
	const ret = Common.split(["aaaaaaa"], "aaa")
	assert.deepStrictEqual(ret, ["aaa", "aaa", "a"])
}
