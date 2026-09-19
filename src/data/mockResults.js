// 模拟数据：3个典型问题的多模型答案 + AI总结
// 模拟网络延迟和流式输出效果
// 新增：追问场景的对话记忆上下文

const mockData = {
  // 场景1：共识型答案 — 新能源车趋势
  new_energy: {
    query: "2026年新能源汽车市场趋势如何？",
    models: [
      {
        id: "deepseek",
        vendor: "深度求索",
        name: "DeepSeek",
        version: "V3",
        icon: "DS",
        color: "#4F46E5",
        answer: "2026年新能源汽车市场呈现三大趋势：\n\n1. **渗透率加速突破**：国内市场渗透率预计达到55%以上，插混车型增速超过纯电。\n\n2. **智能化成核心竞争力**：城市NOA（领航辅助驾驶）渗透率从2025年的12%提升至25%，20万以上车型几乎标配。\n\n3. **价格战进入深水区**：比亚迪、特斯拉持续降价挤压二线品牌，部分新势力面临生存危机。\n\n4. **出海加速**：东南亚、南美成为新增长极，但欧盟关税壁垒带来不确定性。",
        sources: ["中国汽车工业协会", "乘联会 2026 Q1 报告", "工信部数据"],
        consensus: ["渗透率超55%", "智能化是核心", "价格战持续"],
      },
      {
        id: "tongyi",
        vendor: "阿里巴巴",
        name: "千问",
        version: "3.5",
        icon: "TY",
        color: "#0D9488",
        answer: "2026年中国新能源汽车市场正在经历结构性转变：\n\n**市场层面：** 渗透率预计达到53-58%，全年销量突破1200万辆。插混车型增速显著快于纯电，比亚迪DM-i系列持续领跑。\n\n**技术层面：** 800V高压平台普及率大幅提升，充电10分钟续航400公里成为现实。固态电池开始小批量装车。\n\n**竞争格局：** 头部集中度进一步提高，比亚迪市占率约35%，前5名占据70%以上份额。\n\n**出口方面：** 全年出口量预计180-200万辆，但面临欧盟反补贴调查和美国高关税双重压力。",
        sources: ["乘联会 2026年4月数据", "中国汽车工业协会", "IEA Global EV Outlook 2026"],
        consensus: ["渗透率超55%", "智能化是核心", "价格战持续"],
      },
      {
        id: "doubao",
        vendor: "字节跳动",
        name: "豆包",
        version: "Pro",
        icon: "DB",
        color: "#F97316",
        answer: "2026年新能源汽车市场值得关注的几个关键变化：\n\n**渗透率：** 预计全年新能源渗透率在54-56%之间，这意味着每卖出两辆车就有一辆是新能源。\n\n**智能驾驶：** 这可能是2026年最大的变量。华为ADS 3.0和小鹏XNGP的城市覆盖率大幅提升，消费者开始将智驾能力作为购车决策的前三要素。\n\n**价格趋势：** 10-15万价格区间的竞争最为激烈，比亚迪秦PLUS DM-i已降至8.98万起。\n\n**全球化挑战：** 欧盟对中国电动车加征关税后，车企加速在匈牙利、西班牙建厂。\n\n**风险提示：** 需关注产能过剩风险，2026年国内新能源车产能利用率仅65%。",
        sources: ["乘联会 2026 Q1", "各车企公告", "欧盟官方公报"],
        consensus: ["渗透率超55%", "智能化是核心", "价格战持续"],
      },
    ],
    summary: {
      consensus:
        "三个AI模型高度一致地认为：2026年新能源汽车渗透率将突破55%，智能化（尤其是城市NOA）成为核心竞争力，价格战持续加剧，出海面临欧盟关税挑战。",
      divergence:
        "在具体数据上存在细微差异：渗透率预测区间为53-58%，出口量预测区间为180-200万辆。对\"插混vs纯电\"的侧重程度不同，但整体方向一致。",
      recommendation:
        "基于三个模型的交叉验证，2026年新能源车市场趋势判断可信度较高。建议重点关注：1) 智能驾驶技术落地进展；2) 10-15万价格带竞争格局；3) 欧盟贸易政策变化。",
      trustScore: 92,
    },
  },

  // 场景2：分歧型答案 — React vs Vue
  react_vue: {
    query: "2026年React和Vue应该如何选型？",
    models: [
      {
        id: "deepseek",
        vendor: "深度求索",
        name: "DeepSeek",
        version: "V3",
        icon: "DS",
        color: "#4F46E5",
        answer: "2026年的选型建议：\n\n**推荐React的场景：**\n- 大型企业级应用（TypeScript生态更成熟）\n- 需要React Native进行跨平台开发\n- 团队已有React经验\n- 需要丰富的第三方库生态（React有400万+ npm包依赖）\n\n**React的2026年优势：**\n- React Server Components (RSC) 已经成熟\n- Next.js 15成为事实标准\n- AI/LLM集成生态更完善（Vercel AI SDK等）\n\n**结论：** 大多数商业项目建议选React，除非有特殊理由选Vue。",
        sources: ["Stack Overflow 2026 Survey", "npm trends", "GitHub Octoverse"],
        consensus: [],
      },
      {
        id: "tongyi",
        vendor: "阿里巴巴",
        name: "千问",
        version: "3.5",
        icon: "TY",
        color: "#0D9488",
        answer: "2026年React vs Vue选型分析：\n\n**推荐Vue的场景：**\n- 中小型项目，追求开发效率\n- 国内项目（Vue在国内占有率更高，约42%）\n- 团队偏向模板式开发（Vue SFC更直观）\n- 需要渐进式引入（Vue可以按需使用）\n\n**Vue的2026年优势：**\n- Vue 3.5 + Vite 6 开发体验极佳\n- 国内生态完善（Element Plus、Ant Design Vue）\n- 学习曲线更平缓，招人成本低\n\n**结论：** 国内中小团队建议优先考虑Vue，效率和成本更优。大型项目或国际化团队选React。",
        sources: ["Vue.js 官方文档", "掘金 2026 前端报告", "State of JS 2025"],
        consensus: [],
      },
      {
        id: "doubao",
        vendor: "字节跳动",
        name: "豆包",
        version: "Pro",
        icon: "DB",
        color: "#F97316",
        answer: "2026年前端框架选型，我的看法是：\n\n**不要纠结框架本身，要看团队和场景：**\n\nReact和Vue在2026年功能上已经没有本质差距，都是成熟的解决方案。关键在于：\n\n1. **团队能力：** 团队熟悉哪个就用哪个，学习成本远大于框架差异\n2. **项目规模：** React在超大型项目（100+开发者）的工程化更成熟\n3. **市场招聘：** React开发者更多但竞争也大，Vue开发者更专注\n4. **国内特殊因素：** 政企项目倾向Vue（可控性更强），互联网大厂偏React\n\n**个人观点：** 如果从零开始学，React的生态系统会让你走得更远。如果已经会Vue，没必要换。",
        sources: ["Stack Overflow Developer Survey 2026", "知乎前端话题", "掘金社区"],
        consensus: [],
      },
    ],
    summary: {
      consensus:
        "三个模型都同意：React和Vue在2026年都已非常成熟，功能上没有本质差距。选择应基于团队能力、项目规模和具体场景，而非技术优劣。",
      divergence:
        "存在明显分歧：DeepSeek明确推荐React作为默认选择，通义千问倾向于推荐Vue（尤其在国内场景），Kimi持中立态度认为应该看团队。分歧源于对\"默认场景\"的不同假设——DeepSeek偏向大型/国际化项目，通义千问偏向中小/国内项目。",
      recommendation:
        "综合三个模型的意见：1) 国内中小团队/追求效率 → Vue；2) 大型企业/国际化/跨平台 → React；3) 不确定的话，选团队最熟悉的技术栈。最差的决策是反复纠结不行动。",
      trustScore: 78,
    },
  },

  // 场景3：建议型答案 — 远程工作效率
  remote_work: {
    query: "如何有效提高远程工作效率？",
    models: [
      {
        id: "deepseek",
        vendor: "深度求索",
        name: "DeepSeek",
        version: "V3",
        icon: "DS",
        color: "#4F46E5",
        answer: "提高远程工作效率的系统方法：\n\n**1. 时间管理（最重要）**\n- 采用\"时间块\"（Time Blocking）方法，每天划分3-4个90分钟深度工作块\n- 上午处理创造性工作，下午处理沟通和行政事务\n- 使用番茄工作法（25+5）保持专注\n\n**2. 环境优化**\n- 独立工作空间，与生活区物理隔离\n- 降噪耳机是远程工作者最重要的硬件投资\n\n**3. 工具链**\n- 异步沟通为主：Loom录屏 + Notion文档\n- 同步沟通为辅：飞书/钉钉仅用于紧急事项\n- 项目管理：Linear / 飞书多维表格\n\n**4. 自我管理**\n- 每天写\"3件事清单\"（最重要的3个任务）\n- 每周五做周回顾和下周规划",
        sources: ["Deep Work by Cal Newport", "GitLab Remote Playbook", "Harvard Business Review"],
        consensus: [],
      },
      {
        id: "tongyi",
        vendor: "阿里巴巴",
        name: "千问",
        version: "3.5",
        icon: "TY",
        color: "#0D9488",
        answer: "远程工作效率提升的实操建议：\n\n**沟通层面：**\n- 建立\"核心工作时间\"（如10:00-12:00, 14:00-17:00），期间减少会议\n- 使用异步视频（如飞书妙记）替代实时会议，节省50%以上时间\n- 重要决策写文档而非口头传达\n\n**工具层面：**\n- 飞书多维表格做项目跟踪\n- 飞书文档做知识沉淀\n- 腾讯会议做定期同步（每周2次，每次30分钟以内）\n\n**个人层面：**\n- 保持固定作息，避免\"随时在线\"导致的倦怠\n- 每天安排15分钟\"社交时间\"（线上茶水间），防止孤独感\n- 定期线下见面（每月至少1次团队聚会）\n\n**管理层面：**\n- 结果导向而非过程监控\n- 每周1对1沟通，关注状态而非进度",
        sources: ["飞书远程办公指南", "得到APP 远程协作课", "McKinsey远程工作研究"],
        consensus: [],
      },
      {
        id: "doubao",
        vendor: "字节跳动",
        name: "豆包",
        version: "Pro",
        icon: "DB",
        color: "#F97316",
        answer: "远程工作效率的底层逻辑和具体方法：\n\n**核心认知：** 远程工作的最大敌人不是懒惰，而是\"无边界感\"。工作时间无限延长导致效率反而下降。\n\n**具体方法：**\n\n1. **设置硬边界：** 固定开始和结束时间，到点关电脑。研究发现，有明确边界感的远程工作者效率高出34%。\n\n2. **异步优先原则：** 把\"这个会能不能不开\"作为默认问题。异步沟通（文档+录屏）替代80%的会议。\n\n3. **深度工作保护：** 每天至少2小时\"免打扰模式\"，关闭所有通知。这2小时的产出往往超过全天其余时间。\n\n4. **能量管理 > 时间管理：** 识别自己的高能量时段，把最重要的工作安排在那时。\n\n5. **社交补给：** 每周安排1-2次非工作性质的线上社交，防止孤立感影响心理健康。",
        sources: ["Remote: Office Not Required (37signals)", "Stanford WFH Research", "Buffer State of Remote Work 2026"],
        consensus: [],
      },
    ],
    summary: {
      consensus:
        "三个模型一致认同：远程工作的核心是建立边界感和采用异步沟通。具体共识包括：固定工作时间、保护深度工作时段、用文档替代会议、定期社交补给。",
      divergence:
        "侧重点不同：DeepSeek强调系统方法论（时间块、工具链），通义千问侧重国内工具生态和团队管理，Kimi从心理学角度强调边界感和能量管理。三者互为补充而非冲突。",
      recommendation:
        "综合建议：1) 立即建立固定作息和深度工作时段；2) 团队层面推行异步沟通（文档优先）；3) 管理者改为结果导向；4) 保留必要的社交和线下见面。这三个模型的建议可以组合使用——DeepSeek的方法论 + 通义千问的工具推荐 + Kimi的底层认知。",
      trustScore: 88,
    },
  },
};

// ==================== 追问场景（基于记忆的对话） ====================

const followUpData = {
  // 新能源车 → 追问"哪些品牌值得关注"
  new_energy__brands: {
    parentKey: "new_energy",
    query: "那哪些品牌最值得关注？",
    models: [
      {
        id: "deepseek",
        vendor: "深度求索",
        name: "DeepSeek",
        version: "V3",
        icon: "DS",
        color: "#4F46E5",
        answer: "基于刚才讨论的新能源车市场趋势，值得关注的品牌分三个梯队：\n\n**第一梯队（确定性高）：**\n- **比亚迪**：市占率35%，DM-i技术壁垒深厚，2026年预计销量450万+\n- **特斯拉**：FSD V13在华落地是关键变量，Model 2若发布将冲击15万市场\n\n**第二梯队（高成长性）：**\n- **理想汽车**：增程+纯电双线，MEGA系列补位纯电MPV市场\n- **问界（华为）**：ADS 3.0智驾体验领先，2026年目标80万辆\n\n**第三梯队（黑马潜力）：**\n- **小米汽车**：SU7持续热销，第二款车MX11值得关注\n- **小鹏汽车**：MONA品牌下沉10-15万市场，智驾技术变现\n\n**风险提示：** 蔚来换电模式能否盈利仍存疑，威马/天际等已出局警示。",
        sources: ["各车企2026 Q1财报", "乘联会销量数据"],
        consensus: ["比亚迪确定性最高", "智驾能力是核心分化点"],
      },
      {
        id: "tongyi",
        vendor: "阿里巴巴",
        name: "千问",
        version: "3.5",
        icon: "TY",
        color: "#0D9488",
        answer: "结合刚才的市场分析，2026年值得重点关注的品牌：\n\n**确定性强：**\n- 比亚迪：全价位覆盖，从海鸥(7万)到仰望(100万+)，规模优势不可撼动\n- 特斯拉：品牌溢价+FSD技术，Model Y仍是全球销冠\n\n**智驾领先：**\n- 问界(华为)：城区NCA覆盖率最高，用户口碑好\n- 小鹏：XNGP覆盖全国，MONA品牌拉低智驾门槛\n\n**新势力突围：**\n- 理想：家庭用户定位精准，L6/L7持续热销\n- 小米：生态优势(手机+车+家居)，SU7交付破15万\n\n**投资视角：** 港股关注比亚迪股份、理想汽车、小鹏汽车；A股关注赛力斯(问界代工)、江淮汽车(华为合作)。",
        sources: ["东方财富 新能源板块", "各车企公告", "汽车之家评测"],
        consensus: ["比亚迪确定性最高", "智驾能力是核心分化点"],
      },
      {
        id: "doubao",
        vendor: "字节跳动",
        name: "豆包",
        version: "Pro",
        icon: "DB",
        color: "#F97316",
        answer: "基于之前对市场趋势的分析，品牌关注建议：\n\n**必看：**\n- 比亚迪：虽然股价已高，但基本面最强，DM 5.0技术降维打击\n- 问界：华为ADS持续迭代，M7/M9在30-50万区间无对手\n\n**高赔率：**\n- 小米：第二款车决定天花板，如果MX11月销破2万将是重大催化剂\n- 零跑：Stellantis合作打开欧洲渠道，出海故事最顺畅\n\n**谨慎：**\n- 蔚来：换电模式资金压力大，需关注Q2现金流\n- 哪吒/威马：市场份额持续下滑，警惕尾部风险\n\n**我的判断：** 2026年是新能源车的\"淘汰赛\"年份，前5名吃肉，6-10名喝汤，10名以外挣扎求生。建议重点关注前5名：比亚迪、特斯拉、问界、理想、小米。",
        sources: ["36氪 新能源车分析", "车东西 2026展望", "各车企投资者关系"],
        consensus: ["比亚迪确定性最高", "智驾能力是核心分化点"],
      },
    ],
    summary: {
      consensus:
        "三个模型基于之前的市场趋势讨论，一致认为比亚迪和问界(华为)是最值得关注的两个品牌。比亚迪靠规模和技术壁垒，问界靠智驾体验。",
      divergence:
        "对小米的判断存在分歧：DeepSeek和Kimi认为有黑马潜力，通义千问更看重其生态优势但未将其列入第一梯队。对蔚来的态度也略有不同。",
      recommendation:
        "结合之前的市场分析和本次品牌筛选：建议核心关注比亚迪+问界组合，卫星仓位关注小米。2026年关键词是\"淘汰赛\"，强者恒强，弱者出局。",
      trustScore: 85,
    },
  },

  // React vs Vue → 追问"具体怎么开始学"
  react_vue__learn: {
    parentKey: "react_vue",
    query: "那我应该从哪个开始学？怎么入门？",
    models: [
      {
        id: "deepseek",
        vendor: "深度求索",
        name: "DeepSeek",
        version: "V3",
        icon: "DS",
        color: "#4F46E5",
        answer: "基于之前React vs Vue的讨论，我的学习建议：\n\n**如果你选择React（推荐）：**\n\n1. **第1周：** 官方新文档(react.dev) + 完成Tic-Tac-Toe教程\n2. **第2-3周：** 学习Next.js(App Router)，因为2026年React项目几乎都是Next.js\n3. **第4周：** 做一个实战项目——个人博客或Todo App\n4. **进阶：** Server Components、Streaming、AI SDK集成\n\n**关键资源：**\n- react.dev（新版官方文档，质量极高）\n- Next.js Learn 课程（免费）\n- Vercel AI SDK 文档（React+AI是2026年最热方向）\n\n**时间投入：** 全职学习约4-6周可达到商业开发水平。",
        sources: ["react.dev", "nextjs.org/learn", "Vercel AI SDK docs"],
        consensus: [],
      },
      {
        id: "tongyi",
        vendor: "阿里巴巴",
        name: "千问",
        version: "3.5",
        icon: "TY",
        color: "#0D9488",
        answer: "结合刚才的选型分析，学习路线建议：\n\n**如果你选择Vue（国内项目推荐）：**\n\n1. **第1周：** Vue 3官方文档（cn.vuejs.org）+ 理解响应式原理\n2. **第2周：** Vite + Vue Router + Pinia 搭建项目骨架\n3. **第3周：** 学习Element Plus组件库，做一个后台管理系统\n4. **第4周：** 深入Composition API、TypeScript集成\n\n**关键资源：**\n- Vue 3中文文档（翻译质量好）\n- 掘金Vue专题\n- 若依框架（Ruoyi-Vue）学习企业级实践\n\n**就业优势：** 国内Vue岗位多，竞争相对小，3个月可达到求职水平。",
        sources: ["cn.vuejs.org", "掘金 Vue专区", "Element Plus 官方"],
        consensus: [],
      },
      {
        id: "doubao",
        vendor: "字节跳动",
        name: "豆包",
        version: "Pro",
        icon: "DB",
        color: "#F97316",
        answer: "基于刚才的讨论，我的实操建议：\n\n**先做一个\"体验周\"：**\n\n- 用2天时间跟着React教程做一个小组件\n- 用2天时间跟着Vue教程做同样的小组件\n- 感受哪个让你更舒服、更顺手\n\n**然后全力投入：**\n\n无论选哪个，学习路径都是：\n1. 官方教程通关（1周）\n2. 做一个完整的CRUD应用（2周）\n3. 学习状态管理+路由（1周）\n4. 学习测试+部署（1周）\n\n**2026年的建议：**\n\n如果你对AI方向感兴趣 → React（AI SDK生态更完善）\n如果你瞄准国内公司 → Vue（岗位匹配度更高）\n如果不确定 → React（全球生态更大，长期天花板更高）\n\n**最重要的：** 不要在学习阶段反复纠结框架选择，选一个就开始，3个月后两个都能上手。",
        sources: ["roadmap.sh/frontend", "前端早读课", "freeCodeCamp"],
        consensus: [],
      },
    ],
    summary: {
      consensus:
        "三个模型都同意：无论选React还是Vue，都应该先做官方教程，再做实战项目。Kimi特别建议花2天时间两个都试一下再做决定。",
      divergence: "DeepSeek明确推荐React（尤其AI方向），通义千问推荐Vue（国内就业），Kimi建议\"试2天再决定\"。",
      recommendation:
        "综合三个模型的建议：1) 花2天两个都试试（Kimi方案）；2) AI方向选React，国内就业选Vue；3) 不管选哪个，4周全职学习+1个实战项目即可入门。最重要的是——不要反复纠结，今天就打开官方文档开始。",
      trustScore: 90,
    },
  },

  // 远程工作 → 追问"工具有什么推荐"
  remote_work__tools: {
    parentKey: "remote_work",
    query: "有什么具体工具推荐吗？最好是免费的",
    models: [
      {
        id: "deepseek",
        vendor: "深度求索",
        name: "DeepSeek",
        version: "V3",
        icon: "DS",
        color: "#4F46E5",
        answer: "基于刚才讨论的远程工作方法论，推荐以下免费/低成本工具组合：\n\n**异步沟通（核心）：**\n- **Loom**：免费版可录5分钟视频，异步传达复杂想法\n- **Notion**：个人免费，团队$10/月，文档+知识库+项目管理一体\n- **GitHub Issues/Projects**：免费，适合技术团队\n\n**同步沟通（按需）：**\n- **Discord**：免费，语音+文字，比Slack更轻量\n- **腾讯会议**：免费100人/60分钟，够用\n\n**专注工具：**\n- **Forest App**：免费版够用，番茄钟+种树\n- **Toggl Track**：免费版可追踪时间\n\n**总成本：** 个人完全免费，小团队<$50/月。",
        sources: ["各工具官网", "Remote Work Tools 2026"],
        consensus: ["Loom+Notion是黄金组合", "免费工具足够个人使用"],
      },
      {
        id: "tongyi",
        vendor: "阿里巴巴",
        name: "千问",
        version: "3.5",
        icon: "TY",
        color: "#0D9488",
        answer: "结合刚才的远程工作建议，推荐国内好用的免费工具：\n\n**沟通协作：**\n- **飞书**：个人免费，文档+多维表格+视频会议一体\n- **钉钉**：免费版功能全面，适合传统企业\n- **企业微信**：如果客户用微信，这是最佳选择\n\n**项目管理：**\n- **飞书多维表格**：免费，比Notion更符合国内习惯\n- **Teambition**：免费10人，阿里系\n- **Trello**：免费版够基础使用\n\n**效率工具：**\n- **滴答清单**：免费版可做任务管理\n- **番茄ToDo**：免费番茄钟，国内用户最多\n- **飞书妙记**：免费，会议自动转文字\n\n**推荐组合：** 飞书全家桶（文档+多维表格+妙记+视频会议），零成本覆盖90%需求。",
        sources: ["飞书官网", "少数派 远程工具推荐", "钉钉官网"],
        consensus: ["Loom+Notion是黄金组合", "免费工具足够个人使用"],
      },
      {
        id: "doubao",
        vendor: "字节跳动",
        name: "豆包",
        version: "Pro",
        icon: "DB",
        color: "#F97316",
        answer: "基于之前的远程工作讨论，我的免费工具推荐更注重\"极简\"：\n\n**最少工具原则：只用3个工具**\n\n1. **文档/知识库：Notion（个人免费）**\n   - 写周报、记会议纪要、建知识库\n   - 模板功能强大，学习成本低\n\n2. **沟通：飞书（个人免费）**\n   - 替代微信聊工作（重要！工作生活分离）\n   - 视频会议+文档+日历一站式\n\n3. **任务管理：Todoist（免费版）**\n   - 比滴答清单更简洁\n   - 自然语言输入\"明天下午3点开会\"自动识别\n\n**为什么只推荐3个？**\n\n工具越多，切换成本越高。3个工具覆盖文档、沟通、任务，刚好够用不冗余。",
        sources: ["少数派 工具测评", "Product Hunt 2026", "个人实践"],
        consensus: ["Loom+Notion是黄金组合", "免费工具足够个人使用"],
      },
    ],
    summary: {
      consensus:
        "三个模型都认为免费工具完全足够：飞书/Notion做文档协作，Loom做异步沟通，一个任务管理工具即可。通义千问推荐的国内工具生态对中文用户更友好。",
      divergence:
        "工具数量哲学不同：DeepSeek推荐6个工具精细分工，通义千问推荐飞书全家桶，Kimi坚持只用3个（极简主义）。",
      recommendation:
        "建议从Kimi的\"3工具法则\"开始：Notion（文档）+ 飞书（沟通）+ Todoist（任务）。先用2周，感觉缺什么再加。记住之前的结论——工具是辅助，边界感和异步沟通才是核心。",
      trustScore: 91,
    },
  },
};

export { followUpData };
export default mockData;

const createGenericData = (query, selectedModels) => {
  const sourceModels = mockData.new_energy.models;
  const modelIds = selectedModels?.length ? selectedModels : sourceModels.map((model) => model.id);
  const models = modelIds.map((id, index) => {
    const source = sourceModels.find((model) => model.id === id) || sourceModels[index % sourceModels.length];
    return {
      ...source,
      id,
      answer: `这是针对“${query}”的模拟回答。当前尚未接入真实模型，先提供一个可继续交互的演示结果。\n\n建议从目标、约束和可执行步骤三个方面继续拆解这个问题。`,
      sources: ['Vier Search 模拟来源'],
      consensus: ['需要结合具体场景判断'],
    };
  });

  return {
    query,
    models,
    summary: {
      consensus: `围绕“${query}”，当前模拟结果认为应先明确问题目标，再比较不同方案的实际取舍。`,
      divergence: '由于当前使用的是模拟回答，模型之间没有真实分歧数据可供比较。',
      recommendation: `建议将“${query}”拆分为背景、目标、限制条件和下一步行动，再进行更具体的分析。`,
      trustScore: 60,
    },
  };
};

// 模拟延迟和流式输出
// queryKey 支持两种格式：
//   "new_energy" → 首次搜索
//   "new_energy__brands" → 基于记忆的追问（__ 分隔 parentKey 和 followUpKey）
export const simulateSearch = async (queryKey, onProgress, isFollowUp = false, selectedModels) => {
  let data;
  if (isFollowUp) {
    data = followUpData[queryKey];
  } else {
    data = mockData[queryKey];
  }
  if (!data) data = createGenericData(queryKey, selectedModels);

  const modelIds = selectedModels?.length ? new Set(selectedModels) : null;
  const models = modelIds
    ? data.models.filter((model) => modelIds.has(model.id))
    : data.models;
  if (models.length === 0) return createGenericData(queryKey, selectedModels);

  // 模拟搜索阶段
  onProgress?.({ stage: "searching" });

  // 模拟每个模型逐步返回
  const answers = [];
  for (let i = 0; i < models.length; i++) {
    await delay(800 + Math.random() * 600);
    answers.push(models[i]);
    onProgress?.({ stage: "searching", answers: [...answers], modelIndex: i });
  }

  // 模拟AI总结
  onProgress?.({ stage: "summarizing" });
  await delay(1200 + Math.random() * 800);

  const summary = models.length === data.models.length
    ? data.summary
    : createGenericData(data.query, models.map((model) => model.id)).summary;
  onProgress?.({ stage: "done", summary, answers: models, isFollowUp });
  return { ...data, models, summary, answers: models };
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
