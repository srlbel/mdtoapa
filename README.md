# Markdown to APA-html

## TODO
- bibtex support
- table of contents and table of figures

# Usage

```bash
node src/index.js <input_file> <output_file>
# or
npm run build # with defaults as "test.md" "paper.html" respectively
```

# Considerations

## Images
In order to have proper image formatting, they should be written as:
``` md
[name](file_path "Figure 1. description")
```
> [!NOTE]
> This will soon change

## Tables
In order to have proper table formatting, they should be written as:
```md
| Name | Age |
| ---- | --- |
| Ana  | 24  |
| Luis | 31  |

Tabla: Edad de los participantes por nombre
```

so they have a footer like `Tabla 5. Matriz de entregables`

## Page distribution
HTML doesn't allow the "page distribution" for headings of level 1, so, the html
must be printed to see the distribution, so the pipeline is mostly `markdown > html > pdf`