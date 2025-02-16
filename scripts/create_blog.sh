#constant vars
DB_NAME="prod-d1"

# get title from input
read -p "Enter title: " title
if [ -z "$title" ]; then
    echo "Error: Title cannot be empty."
    exit 1
fi

# init vars
title=$title
description="description"
pubDate=$(date +"%b' '%d' '%Y")
blogID=$(bun scripts/ulid.ts)
heroImage="heroImage"
migration_name="insert_blog_$blogID"

export title description pubDate blogID heroImage

# print all vars to check
echo "title: $title"
echo "description: $description"
echo "pubDate: $pubDate"
echo "blogID: $blogID"
echo "heroImage: $heroImage"

if ! envsubst <./scripts/template.md >"src/content/blog/$title.md"; then
    echo "Failed to create markdown file."
    exit 1
fi

bunx wrangler d1 migrations create $DB_NAME $migration_name

target=$(find migrations -name "*_$migration_name.sql")

query="INSERT INTO blogs (id, name, likes_count) VALUES (\"${blogID}\", \"${title}\", 0);"

echo $query >>$target
