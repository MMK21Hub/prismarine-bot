# Only fire if new plugin files were generated:
if [ -d dist/plugins ]; then
  rm -r plugins
  mv dist/plugins .

  for file in plugins/*.js; do
    tail -n +2 "$file" > "$file.tmp"
    mv "$file.tmp" "$file"
  done
fi

