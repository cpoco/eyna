package main

import (
	"archive/tar"
	"archive/zip"
	"compress/gzip"
	"io"
	"os"
	"time"
)

var timestamp = time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)

func main() {
	{
		f, _ := os.Create("test.zip")
		defer f.Close()

		w := zipWriter(f)
		defer w.Close()

		zipWrite(w, "🍋", []byte("🍋"))
		zipWrite(w, "🍋‍🟩", []byte("🍋‍🟩"))

		zipWrite(w, "file.txt", []byte("file.txt"))

		zipWrite(w, "dir/", nil)
		zipWrite(w, "dir/file.txt", []byte("dir/file.txt"))

		zipWrite(w, "dir/dir/dir/dir/dir/", nil)
	}

	{
		f, _ := os.Create("test.tar")
		defer f.Close()

		w := tarWriter(f)
		defer w.Close()

		tarWrite(w, "🍋", []byte("🍋"))
		tarWrite(w, "🍋‍🟩", []byte("🍋‍🟩"))

		tarWrite(w, "file.txt", []byte("file.txt"))

		tarWrite(w, "dir/", nil)
		tarWrite(w, "dir/file.txt", []byte("dir/file.txt"))

		tarWrite(w, "dir/dir/dir/dir/dir/", nil)
	}

	{
		f, _ := os.Create("test.tgz")
		defer f.Close()

		gz := gzipWriter(f)
		defer gz.Close()

		w := tarWriter(gz)
		defer w.Close()

		tarWrite(w, "🍋", []byte("🍋"))
		tarWrite(w, "🍋‍🟩", []byte("🍋‍🟩"))

		tarWrite(w, "file.txt", []byte("file.txt"))

		tarWrite(w, "dir/", nil)
		tarWrite(w, "dir/file.txt", []byte("dir/file.txt"))

		tarWrite(w, "dir/dir/dir/dir/dir/", nil)
	}
}

func zipWriter(w io.Writer) *zip.Writer {
	return zip.NewWriter(w)
}

func zipWrite(w *zip.Writer, path string, data []byte) {
	if len(path) == 0 {
		return
	}

	isDir := path[len(path)-1] == '/'

	header := &zip.FileHeader{
		Name:           path,
		CreatorVersion: 0x0314, // 0x0300 (Unix) + 0x0014 (v20)
		Modified:       timestamp,
	}
	if isDir {
		header.SetMode(os.FileMode(0755 | os.ModeDir))
	} else {
		header.SetMode(os.FileMode(0644))
	}

	fw, _ := w.CreateHeader(header)
	if data != nil && !isDir {
		fw.Write(data)
	}
}

func gzipWriter(w io.Writer) *gzip.Writer {
	return gzip.NewWriter(w)
}

func tarWriter(w io.Writer) *tar.Writer {
	return tar.NewWriter(w)
}

func tarWrite(w *tar.Writer, path string, data []byte) {
	if len(path) == 0 {
		return
	}

	isDir := path[len(path)-1] == '/'

	header := &tar.Header{
		Name:    path,
		ModTime: timestamp,
	}
	if isDir {
		header.Typeflag = tar.TypeDir
		header.Mode = int64(0755)
		header.Size = 0
	} else {
		header.Typeflag = tar.TypeReg
		header.Mode = int64(0644)
		header.Size = int64(len(data))
	}

	w.WriteHeader(header)
	if data != nil && !isDir {
		w.Write(data)
	}
}
