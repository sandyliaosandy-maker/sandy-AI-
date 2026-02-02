---
title: "KernelCAT破局CUDA"
date: 2026-01-31
tags: ["媒体"]
score: 9
source: "InfoQ中文"
underwaterInfo: "• 国产AI模型迁移到国产芯片（如昇腾）时，面临的核心瓶颈并非硬件性能，而是缺乏高效、兼容的算子支持，导致迁移成本高昂且寸步难行。\n• 高性能算子开发目前仍处于“手工作坊”时代，极度依赖顶尖工程师的经验和反复试错，开发周期动辄数月，性能调优如同在迷雾中摸索，这是行业内部普遍存在但公开讨论较少的核心痛点。\n• 在昇腾芯片上，通过运筹学建模和数学优化算法对算子分块参数进行自动调优（如FlashAttentionScore算子），可以在十几轮迭代内锁定最优配置，实现延迟降低最高22%、吞吐量提升近30%，且无需人工干预，这是一种超越传统手工试错的系统性优化方法。\n• 将DeepSeek-OCR-2等模型从CUDA生态迁移到昇腾NPU时，会遭遇“版本地狱”，即vLLM、torch和torch_npu等依赖库之间存在版本互锁的三角矛盾，需要精准的依赖识别和补丁注入才能搭建稳定环境。\n• 针对vLLM中的MOE层，原版依赖CUDA专有操作，需要识别并替换为vllm-ascend提供的Ascend原生MOE实现（通过插件包调用），这是让模型在国产芯片上高效运行（实现35倍加速）的关键替换步骤，而非简单的接口适配。"
caseExtraction: "1. 中国 KernelCAT团队通过其AI Agent（KernelCAT）为昇腾芯片的算子开发提供自动调优服务。该团队使用KernelCAT对昇腾芯片上的FlashAttentionScore算子进行自动运筹学建模和参数调优。在多种输入尺寸下，算子延迟降低最高达22%，吞吐量提升最高近30%。整个过程无需人工干预。\n\n2. 中国 KernelCAT团队通过其AI Agent（KernelCAT）为华为昇腾平台提供高性能算子开发服务。该团队在昇腾平台上，针对7个不同规模的向量加法任务，对比测试了华为开源算子、商业化算子与KernelCAT自研算子的性能。KernelCAT自研算子在所有7个测试规模中性能均领先，且任务完成仅用时10分钟。这表明其优化方式具备竞争力。\n\n3. 中国 KernelCAT团队通过其AI Agent（KernelCAT）为DeepSeek-OCR-2模型在华为昇腾910B2 NPU上的部署提供迁移适配服务。该服务包括解决依赖版本冲突、替换CUDA专有操作以实现模型在国产芯片上的高效运行。在引入原生MOE实现补丁后，vLLM的吞吐量飙升至550.45 toks/s，相比Transformers方案实现了35倍加速。原本需数周的适配工作可缩短至小时级。"
relatedCompanies: "英伟达,台积电,富士康,华为,OpenAI,AMD,Deepseek,KernelCAT,Hugging Face,昇腾"
---

# KernelCAT破局CUDA

**来源**: InfoQ中文

## 金句

💎 我们不再满足于在别人的地基上盖楼，而是要打好属于自己的 AI“地基”

## 水下信息

• 国产AI模型迁移到国产芯片（如昇腾）时，面临的核心瓶颈并非硬件性能，而是缺乏高效、兼容的算子支持，导致迁移成本高昂且寸步难行。
• 高性能算子开发目前仍处于“手工作坊”时代，极度依赖顶尖工程师的经验和反复试错，开发周期动辄数月，性能调优如同在迷雾中摸索，这是行业内部普遍存在但公开讨论较少的核心痛点。
• 在昇腾芯片上，通过运筹学建模和数学优化算法对算子分块参数进行自动调优（如FlashAttentionScore算子），可以在十几轮迭代内锁定最优配置，实现延迟降低最高22%、吞吐量提升近30%，且无需人工干预，这是一种超越传统手工试错的系统性优化方法。
• 将DeepSeek-OCR-2等模型从CUDA生态迁移到昇腾NPU时，会遭遇“版本地狱”，即vLLM、torch和torch_npu等依赖库之间存在版本互锁的三角矛盾，需要精准的依赖识别和补丁注入才能搭建稳定环境。
• 针对vLLM中的MOE层，原版依赖CUDA专有操作，需要识别并替换为vllm-ascend提供的Ascend原生MOE实现（通过插件包调用），这是让模型在国产芯片上高效运行（实现35倍加速）的关键替换步骤，而非简单的接口适配。

## 案例提取

1. 中国 KernelCAT团队通过其AI Agent（KernelCAT）为昇腾芯片的算子开发提供自动调优服务。该团队使用KernelCAT对昇腾芯片上的FlashAttentionScore算子进行自动运筹学建模和参数调优。在多种输入尺寸下，算子延迟降低最高达22%，吞吐量提升最高近30%。整个过程无需人工干预。

2. 中国 KernelCAT团队通过其AI Agent（KernelCAT）为华为昇腾平台提供高性能算子开发服务。该团队在昇腾平台上，针对7个不同规模的向量加法任务，对比测试了华为开源算子、商业化算子与KernelCAT自研算子的性能。KernelCAT自研算子在所有7个测试规模中性能均领先，且任务完成仅用时10分钟。这表明其优化方式具备竞争力。

3. 中国 KernelCAT团队通过其AI Agent（KernelCAT）为DeepSeek-OCR-2模型在华为昇腾910B2 NPU上的部署提供迁移适配服务。该服务包括解决依赖版本冲突、替换CUDA专有操作以实现模型在国产芯片上的高效运行。在引入原生MOE实现补丁后，vLLM的吞吐量飙升至550.45 toks/s，相比Transformers方案实现了35倍加速。原本需数周的适配工作可缩短至小时级。

## 涉及公司

英伟达
台积电
富士康
华为
OpenAI
AMD
Deepseek
KernelCAT
Hugging Face
昇腾

## 原标题

[“天下苦CUDA久矣！”KernelCAT率先掀桌，实现国产芯片无痛适配 ...](https://www.infoq.cn/article/JAmVx35sxdz0ubB7l0Ua?utm_source=rss&utm_medium=article)

