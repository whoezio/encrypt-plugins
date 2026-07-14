(function () {
  "use strict";

  /**
   * CSV 表格预览插件
   * 使用 React.createElement 渲染 HTML 表格
   * 完全自包含，无外部依赖
   */

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function parseCsv(text) {
    var rows = text.split(/\r?\n/);
    var headers = null;
    var data = [];
    for (var i = 0; i < rows.length; i++) {
      var line = rows[i].trim();
      if (!line) continue;
      var fields = [];
      var current = "";
      var inQuote = false;
      for (var c = 0; c < line.length; c++) {
        var ch = line[c];
        if (inQuote) {
          if (ch === '"') {
            if (c + 1 < line.length && line[c + 1] === '"') {
              current += '"';
              c++;
            } else {
              inQuote = false;
            }
          } else {
            current += ch;
          }
        } else {
          if (ch === '"') {
            inQuote = true;
          } else if (ch === ",") {
            fields.push(current);
            current = "";
          } else {
            current += ch;
          }
        }
      }
      fields.push(current);
      if (!headers) {
        headers = fields;
      } else {
        data.push(fields);
      }
    }
    return { headers: headers || [], data: data };
  }

  function CsvViewer(props) {
    var parsed = parseCsv(props.content);

    return React.createElement("div", {
      style: { padding: "8px 16px 24px", height: "100%", overflow: "auto" }
    },
      React.createElement("div", {
        style: { fontSize: 11, color: "#888", marginBottom: 8 }
      }, "CSV: " + parsed.headers.length + " 列 × " + parsed.data.length + " 行"),

      React.createElement("table", {
        style: { borderCollapse: "collapse", width: "100%", fontSize: 13 }
      },
        parsed.headers.length > 0 && React.createElement("thead", null,
          React.createElement("tr", null,
            React.createElement("th", {
              style: thStyle,
              key: "_row"
            }, "#"),
            parsed.headers.map(function (h, i) {
              return React.createElement("th", { style: thStyle, key: i },
                escapeHtml(h));
            })
          )
        ),

        React.createElement("tbody", null,
          parsed.data.map(function (row, ri) {
            return React.createElement("tr", {
              key: ri,
              style: ri % 2 === 1 ? { background: "rgba(255,255,255,0.02)" } : undefined
            },
              React.createElement("td", { style: tdStyle, key: "_rn" },
                React.createElement("span", { style: { color: "#666", fontSize: 11 } }, String(ri + 1))),
              row.map(function (cell, ci) {
                return React.createElement("td", {
                  style: tdStyle,
                  key: ci,
                  title: cell
                }, escapeHtml(cell));
              })
            );
          })
        )
      )
    );
  }

  var thStyle = {
    border: "1px solid var(--border, #333)",
    padding: "6px 10px",
    textAlign: "left",
    fontWeight: 600,
    background: "rgba(255,255,255,0.04)",
    color: "#e0e0e0",
    fontSize: 12,
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    zIndex: 1,
  };

  var tdStyle = {
    border: "1px solid var(--border, #333)",
    padding: "4px 10px",
    fontSize: 12,
    color: "#ccc",
    maxWidth: 400,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return {
    id: "csv-viewer",
    name: "CSV 表格预览",
    version: "1.0.0",
    description: "以表格形式渲染 CSV 文件，支持表头识别和行号",
    builtin: false,
    contributions: {
      fileViewers: [{
        extensions: [".csv", ".tsv"],
        component: CsvViewer,
        priority: 10,
      }],
    },
  };
})();
