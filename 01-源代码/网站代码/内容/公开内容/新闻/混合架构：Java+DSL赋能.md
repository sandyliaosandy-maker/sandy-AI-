---
title: "混合架构：Java+DSL赋能"
date: 2026-01-21
tags: ["媒体"]
score: 10
source: "InfoQ中文"
underwaterInfo: "• 激进的全托管“Code Interpreter”模式（即赋予LLM联网和Python执行权限）在生产环境中会遭遇三次致命暴击：输入端对非结构化数据（如无后缀URL、加密PDF）处理脆弱导致报错死循环；输出端让LLM从零绘制PDF/Word会导致中文乱码、表格对不齐、使用过期API等灾难性问题；安全上数据流在沙箱内闭环，主程序失去控制权，无法拦截敏感词或违规数据。\n• 企业级Agent架构的核心思想是“收回LLM的底层操作权，只保留其逻辑调度权”，具体分工为：Java负责确定性数据流转与安检，LLM负责意图理解与代码组装，Python沙箱负责在受控环境下执行具体计算。这是确保工业级稳定性的关键内幕。\n• 对Skills实践最大的改进是采用“DSL封装模式”（The Wrapper Pattern），禁止LLM直接导入pandas等库进行底层操作。必须预置一套高度封装的DSL（如`excel_tool.py`），由它自动处理格式、列宽、引擎兼容性等LLM极易出错的工程细节，从而屏蔽LLM的幻觉风险。\n• 在输出侧，针对不同类型文件采取截然不同的交付策略是内幕技巧：对于强结构化的Excel，走Skills路线（LLM组装数据后调用封装工具）；对于富文本的Word/PDF，严禁LLM写代码生成，必须走渲染路线（LLM只输出高质量Markdown并打上特定动作标签，由Java后端实时转换为精美文件）。\n• 在Spring AI体系下实现混合架构时，有一个关键的工程优化细节：通过实现`SkillManager`并设计Session级的“防抖机制”，确保同一个会话中只需向沙箱上传一次Python脚本，避免重复IO，从而提升性能。这是开源社区文档中很少提及的实战经验。"
caseExtraction: "1. 在“智能文档分析 Agent”项目中，该团队通过采用“Java (确定性 ETL) + DSL 封装式 Skills + 实时渲染”的混合架构，为企业级用户提供复杂文档分析服务。核心服务内容包括处理用户对比多份经营数据报表并生成Excel和PDF报告的需求，通过DSL封装模式确保Excel生成的稳定性和安全性，并利用Java后端将Markdown实时渲染为PDF。关键数据体现在系统能精准处理数据计算和文件IO，并成功拦截敏感词。用户反馈表明，该架构有效解决了纯Skills路线的稳定性、安全性和可控性隐患。\n\n2. 在该项目实践中，团队通过构建包含ETL层、Brain层、Skills层和Delivery层的四层逻辑架构，为系统提供工业级稳定性保障。核心服务内容为输入侧使用Java DocPipeline进行文件下载、MIME识别、OCR和敏感词检测，确保喂给LLM的数据是干净、安全、标准化的纯文本。关键改进是收回了LLM的底层操作权，只保留其逻辑调度权。成效是输入端变得可控，避免了LLM对非结构化数据处理的脆弱性和报错死循环。\n\n3. 在Skills层设计上，团队通过为Python沙箱预置一套高度封装的DSL（领域特定语言），为LLM提供受控的代码执行环境。核心服务内容是禁止LLM直接调用pandas等库的底层API，强制其通过封装函数（如`excel_tool.create_excel`）来生成Excel文件，自动处理格式、列宽等工程细节。关键数据是DSL屏蔽了LLM的幻觉风险，解决了中文乱码、表格对不齐等问题。效果是输出端稳定性得到保障，避免了“裸奔”模式下的输出崩坏。\n\n4. 在输出侧文件交付策略上，团队通过“渲染与交付分离”的方法，为不同文件类型提供差异化生成路径。核心服务内容是对强结构化的Excel文件，走Skills路线由沙箱生成；对富文本的Word/PDF文件，则严禁LLM写代码，改为由LLM输出Markdown并由Java后端利用OpenHTMLtoPDF或Pandoc实时渲染。关键设计是LLM在Markdown末尾打上特定动作标签（如`<<<ACTION:CONVERT&#124;pdf>>>`）来触发转换。成效是实现了文件生成的高质量和可控性。\n\n5. 在Spring AI技术体系下，团队通过实现SkillManager和业务调度Handler，为多租户会话提供动态技能注入和意图分流服务。核心服务内容是SkillManager具备Session级“防抖机制”，防止同一会话中重复上传Python脚本，提升性能；Handler则串联Java ETL、LLM推理并依据结果模式（如`[FILE_GENERATED: ...]`或动作标签）进行交付分流。关键数据是避免了重复IO，并确保了数据流在Java主程序的控制之下。效果是增强了系统的安全性和多租户隔离能力。"
relatedCompanies: "Anthropic,InfoQ,Apache,Spring AI"
---

# 混合架构：Java+DSL赋能

**来源**: InfoQ中文

## 金句

💎 收回 LLM 的“底层操作权”，只保留其“逻辑调度权”。
💎 喂给 LLM 的数据是干净、安全、标准化的纯文本。
💎 禁止 LLM 直接进行底层操作，而是预置高度封装的 DSL。

## 水下信息

• 激进的全托管“Code Interpreter”模式（即赋予LLM联网和Python执行权限）在生产环境中会遭遇三次致命暴击：输入端对非结构化数据（如无后缀URL、加密PDF）处理脆弱导致报错死循环；输出端让LLM从零绘制PDF/Word会导致中文乱码、表格对不齐、使用过期API等灾难性问题；安全上数据流在沙箱内闭环，主程序失去控制权，无法拦截敏感词或违规数据。
• 企业级Agent架构的核心思想是“收回LLM的底层操作权，只保留其逻辑调度权”，具体分工为：Java负责确定性数据流转与安检，LLM负责意图理解与代码组装，Python沙箱负责在受控环境下执行具体计算。这是确保工业级稳定性的关键内幕。
• 对Skills实践最大的改进是采用“DSL封装模式”（The Wrapper Pattern），禁止LLM直接导入pandas等库进行底层操作。必须预置一套高度封装的DSL（如`excel_tool.py`），由它自动处理格式、列宽、引擎兼容性等LLM极易出错的工程细节，从而屏蔽LLM的幻觉风险。
• 在输出侧，针对不同类型文件采取截然不同的交付策略是内幕技巧：对于强结构化的Excel，走Skills路线（LLM组装数据后调用封装工具）；对于富文本的Word/PDF，严禁LLM写代码生成，必须走渲染路线（LLM只输出高质量Markdown并打上特定动作标签，由Java后端实时转换为精美文件）。
• 在Spring AI体系下实现混合架构时，有一个关键的工程优化细节：通过实现`SkillManager`并设计Session级的“防抖机制”，确保同一个会话中只需向沙箱上传一次Python脚本，避免重复IO，从而提升性能。这是开源社区文档中很少提及的实战经验。

## 案例提取

1. 在“智能文档分析 Agent”项目中，该团队通过采用“Java (确定性 ETL) + DSL 封装式 Skills + 实时渲染”的混合架构，为企业级用户提供复杂文档分析服务。核心服务内容包括处理用户对比多份经营数据报表并生成Excel和PDF报告的需求，通过DSL封装模式确保Excel生成的稳定性和安全性，并利用Java后端将Markdown实时渲染为PDF。关键数据体现在系统能精准处理数据计算和文件IO，并成功拦截敏感词。用户反馈表明，该架构有效解决了纯Skills路线的稳定性、安全性和可控性隐患。

2. 在该项目实践中，团队通过构建包含ETL层、Brain层、Skills层和Delivery层的四层逻辑架构，为系统提供工业级稳定性保障。核心服务内容为输入侧使用Java DocPipeline进行文件下载、MIME识别、OCR和敏感词检测，确保喂给LLM的数据是干净、安全、标准化的纯文本。关键改进是收回了LLM的底层操作权，只保留其逻辑调度权。成效是输入端变得可控，避免了LLM对非结构化数据处理的脆弱性和报错死循环。

3. 在Skills层设计上，团队通过为Python沙箱预置一套高度封装的DSL（领域特定语言），为LLM提供受控的代码执行环境。核心服务内容是禁止LLM直接调用pandas等库的底层API，强制其通过封装函数（如`excel_tool.create_excel`）来生成Excel文件，自动处理格式、列宽等工程细节。关键数据是DSL屏蔽了LLM的幻觉风险，解决了中文乱码、表格对不齐等问题。效果是输出端稳定性得到保障，避免了“裸奔”模式下的输出崩坏。

4. 在输出侧文件交付策略上，团队通过“渲染与交付分离”的方法，为不同文件类型提供差异化生成路径。核心服务内容是对强结构化的Excel文件，走Skills路线由沙箱生成；对富文本的Word/PDF文件，则严禁LLM写代码，改为由LLM输出Markdown并由Java后端利用OpenHTMLtoPDF或Pandoc实时渲染。关键设计是LLM在Markdown末尾打上特定动作标签（如`<<<ACTION:CONVERT&#124;pdf>>>`）来触发转换。成效是实现了文件生成的高质量和可控性。

5. 在Spring AI技术体系下，团队通过实现SkillManager和业务调度Handler，为多租户会话提供动态技能注入和意图分流服务。核心服务内容是SkillManager具备Session级“防抖机制”，防止同一会话中重复上传Python脚本，提升性能；Handler则串联Java ETL、LLM推理并依据结果模式（如`[FILE_GENERATED: ...]`或动作标签）进行交付分流。关键数据是避免了重复IO，并确保了数据流在Java主程序的控制之下。效果是增强了系统的安全性和多租户隔离能力。

## 涉及公司

Anthropic
InfoQ
Apache
Spring AI

## 原标题

[Agent Skills 落地实战：拒绝“裸奔”，构建确定性与灵活性共存的...](https://www.infoq.cn/article/MUo1faBPQqOwxVDWA9vB?utm_source=rss&utm_medium=article)

