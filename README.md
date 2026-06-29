# 数字里的生育

一个关于中国生育的数据新闻滚动叙事网页（scrollytelling），基于 **2020 年第七次全国人口普查（七普）** 及五普 / 六普、《中国统计年鉴》数据，用滚动交互的图表讲述出生人口、生育年龄、初婚、地区差异、教育、早育与出生性别比等议题。

> 深圳大学 · 数据新闻与可视化课程期末作业 · 2026
> 制作：范馨雅　陈蕾

## 在线预览

如果用 GitHub Pages 部署，访问仓库的 Pages 地址即可（见下方「部署」）。

本地预览（任选其一）：

```bash
# Python
python -m http.server 8000
# 然后浏览器打开 http://localhost:8000

# 或 Node
npx serve
```

> 注意：必须通过本地服务器打开，**不要直接双击 index.html**——页面用 `<script src>` 加载 `data/`、`lib/`，`file://` 协议下浏览器会拦截。

## 内容结构

| 部分 | 主题 | 主要图表 |
|---|---|---|
| 01 | 出生人口的退潮 | 出生断崖 · 生育年龄迁徙 · 初婚年龄推迟 |
| 02 | 生育的地区差异 | 各省（区、市）总和生育率地图 |
| 03 | 教育与生育 | 教育程度 × 平均生育孩次 |
| 04 | 过早的母亲 | 15–19 岁早育孩次 · 城乡差异 |
| 05 | 男孩与女孩 | 出生性别比规模 · 历次趋势 · 孩次×性别 · 各民族 |

## 目录说明

```
index.html        主页面（HTML + CSS + JS 单文件）
data/
  data.js         整理后的核心数据
  china.js        中国省级地图 GeoJSON
lib/
  echarts.min.js  Apache ECharts 5（图表库）
assets/
  cover-cut.png   封面插画
  aside-*-cut.png 各部分配图（已抠透明背景）
```

## 数据来源

主要来自 2020 年第七次全国人口普查（七普），部分历史数据取自五普 / 六普及《中国统计年鉴》。普查长表（编号以 B 开头）为约 10% 抽样，绝对数为推算值（乘约 10 才接近全国规模）；出生性别比的自然值约为 105。详细逐图来源见页面底部「数据来源」。

## 部署到 GitHub Pages

1. 新建仓库，把本目录内的所有文件（`index.html` / `data` / `lib` / `assets` / `README.md`）上传到仓库根目录。
2. 仓库 **Settings → Pages → Build and deployment**，Source 选 `Deploy from a branch`，分支选 `main`、目录选 `/ (root)`，保存。
3. 等待几分钟，访问 `https://<用户名>.github.io/<仓库名>/`。

## 技术

纯静态网页，无需构建：原生 HTML / CSS / JavaScript + [Apache ECharts](https://echarts.apache.org/) 5（SVG 渲染）。
