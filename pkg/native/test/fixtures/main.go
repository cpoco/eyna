package main

import (
	"archive/zip"
	"os"
	"time"
)

func main() {
	f, _ := os.Create("test.zip")
	defer f.Close()

	w := zip.NewWriter(f)
	defer w.Close()

	create(w, "🍋", []byte("🍋"))
	create(w, "🍋‍🟩", []byte("🍋‍🟩"))

	create(w, "file.txt", []byte("file.txt"))

	create(w, "dir/", nil)
	create(w, "dir/file.txt", []byte("dir/file.txt"))

	create(w, "dir/dir/dir/dir/dir/", nil)
}

func create(w *zip.Writer, path string, data []byte) {
	if len(path) == 0 {
		return
	}

	isDir := path[len(path)-1] == '/'

	header := &zip.FileHeader{
		Name:           path,
		CreatorVersion: 0x0314, // 0x0300 (Unix) + 0x0014 (v20)
		Modified:       time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC),
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
