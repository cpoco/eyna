// npx tsx test/split.ts

import * as Util from "@eyna/util"
import assert from "node:assert"

{
	const ret = Util.split([], "")
	assert.deepStrictEqual(ret, [])
}
{
	const ret = Util.split([""], "")
	assert.deepStrictEqual(ret, [])
}
{
	const ret = Util.split(["", ""], "")
	assert.deepStrictEqual(ret, [])
}
{
	const ret = Util.split(["abc"], "")
	assert.deepStrictEqual(ret, ["a", "", "b", "", "c"])
}
{
	const ret = Util.split(["abc", ""], "")
	assert.deepStrictEqual(ret, ["a", "", "b", "", "c"])
}
{
	const ret = Util.split(["", "abc"], "")
	assert.deepStrictEqual(ret, ["a", "", "b", "", "c"])
}
{
	const ret = Util.split(["abc", "def"], "")
	assert.deepStrictEqual(ret, ["a", "", "b", "", "c", "d", "", "e", "", "f"])
}

{
	const ret = Util.split([], ",")
	assert.deepStrictEqual(ret, [])
}
{
	const ret = Util.split([""], ",")
	assert.deepStrictEqual(ret, [])
}
{
	const ret = Util.split(["", ""], ",")
	assert.deepStrictEqual(ret, [])
}
{
	const ret = Util.split([",,,"], ",")
	assert.deepStrictEqual(ret, [",", ",", ","])
}
{
	const ret = Util.split(["abc"], ",")
	assert.deepStrictEqual(ret, ["abc"])
}
{
	const ret = Util.split(["", "abc"], ",")
	assert.deepStrictEqual(ret, ["abc"])
}
{
	const ret = Util.split(["abc", ""], ",")
	assert.deepStrictEqual(ret, ["abc"])
}
{
	const ret = Util.split(["aa,bb,cc"], ",")
	assert.deepStrictEqual(ret, ["aa", ",", "bb", ",", "cc"])
}
{
	const ret = Util.split([",aa,bb,cc,"], ",")
	assert.deepStrictEqual(ret, [",", "aa", ",", "bb", ",", "cc", ","])
}
{
	const ret = Util.split([",,aa,,bb,,cc,,"], ",")
	assert.deepStrictEqual(ret, [",", ",", "aa", ",", ",", "bb", ",", ",", "cc", ",", ","])
}
{
	const ret = Util.split(["aa,bb,cc", "dd,ee,ff"], ",")
	assert.deepStrictEqual(ret, ["aa", ",", "bb", ",", "cc", "dd", ",", "ee", ",", "ff"])
}
{
	const ret = Util.split([",aa,bb,cc,", ",dd,ee,ff,"], ",")
	assert.deepStrictEqual(ret, [",", "aa", ",", "bb", ",", "cc", ",", ",", "dd", ",", "ee", ",", "ff", ","])
}
{
	const ret = Util.split([",,aa,,bb,,", ",,cc,,dd,,"], ",")
	assert.deepStrictEqual(ret, [",", ",", "aa", ",", ",", "bb", ",", ",", ",", ",", "cc", ",", ",", "dd", ",", ","])
}

{
	const ret = Util.split([",aa,bb,cc,", ",dd,ee,ff,"], ",,")
	assert.deepStrictEqual(ret, [",aa,bb,cc,", ",dd,ee,ff,"])
}
{
	const ret = Util.split([",,aa,,bb,,", ",,cc,,dd,,"], ",,")
	assert.deepStrictEqual(ret, [",,", "aa", ",,", "bb", ",,", ",,", "cc", ",,", "dd", ",,"])
}
{
	const ret = Util.split([",,,aa,,,bb,,,", ",,,cc,,,dd,,,"], ",,")
	assert.deepStrictEqual(ret, [",,", ",aa", ",,", ",bb", ",,", ",", ",,", ",cc", ",,", ",dd", ",,", ","])
}

{
	const ret = Util.split(["a", "b"], "ab")
	assert.deepStrictEqual(ret, ["a", "b"])
}

{
	const ret = Util.split(["a"], "aa")
	assert.deepStrictEqual(ret, ["a"])
}
{
	const ret = Util.split(["aa"], "aa")
	assert.deepStrictEqual(ret, ["aa"])
}
{
	const ret = Util.split(["aaa"], "aa")
	assert.deepStrictEqual(ret, ["aa", "a"])
}
{
	const ret = Util.split(["aaaa"], "aa")
	assert.deepStrictEqual(ret, ["aa", "aa"])
}
{
	const ret = Util.split(["aaaaa"], "aa")
	assert.deepStrictEqual(ret, ["aa", "aa", "a"])
}
{
	const ret = Util.split(["aaaaaa"], "aa")
	assert.deepStrictEqual(ret, ["aa", "aa", "aa"])
}
{
	const ret = Util.split(["aaaaaaa"], "aa")
	assert.deepStrictEqual(ret, ["aa", "aa", "aa", "a"])
}

{
	const ret = Util.split(["a"], "aaa")
	assert.deepStrictEqual(ret, ["a"])
}
{
	const ret = Util.split(["aa"], "aaa")
	assert.deepStrictEqual(ret, ["aa"])
}
{
	const ret = Util.split(["aaa"], "aaa")
	assert.deepStrictEqual(ret, ["aaa"])
}
{
	const ret = Util.split(["aaaa"], "aaa")
	assert.deepStrictEqual(ret, ["aaa", "a"])
}
{
	const ret = Util.split(["aaaaa"], "aaa")
	assert.deepStrictEqual(ret, ["aaa", "aa"])
}
{
	const ret = Util.split(["aaaaaa"], "aaa")
	assert.deepStrictEqual(ret, ["aaa", "aaa"])
}
{
	const ret = Util.split(["aaaaaaa"], "aaa")
	assert.deepStrictEqual(ret, ["aaa", "aaa", "a"])
}
