/* ============================================================
   哈夫克集团 · 员工论坛逻辑
   ============================================================ */
(() => {
  const H = window.Haavk;
  const { esc, ago, fmt, toast, store } = H;

  /* ---------------- 员工档案（演示数据） ---------------- */
  const EMPLOYEES = {
    'HK-086417': { name: '陈默',   dept: '运营管理部',     title: '高级专员',     role: 'admin',  roleText: '板块管理员', region: 'APAC-07', years: 6 },
    'HK-023188': { name: '林知远', dept: '能源与动力',     title: '现场工程师',   role: 'core',   roleText: '核心项目组', region: 'EMEA-02', years: 9 },
    'HK-114002': { name: '沈雨桐', dept: '信息安全',       title: '审计员',       role: 'audit',  roleText: '合规审计',   region: 'HQ',      years: 4 },
    'HK-201955': { name: '周野',   dept: '基础设施与建造', title: '见习工程师',   role: 'intern', roleText: '试用期',     region: 'APAC-07', years: 0 }
  };

  /* ---------------- 板块 ---------------- */
  const BOARDS = [
    { id: 'all',       name: '全部主题',      desc: '所有板块' },
    { id: 'notice',    name: '内部通告',      desc: '集团级通知与公示' },
    { id: 'tech',      name: '技术交流',      desc: '工程、研发与现场经验' },
    { id: 'safety',    name: '安全与合规',    desc: '安全通告、合规问答' },
    { id: 'ash',       name: 'ASH-01 区域',   desc: '阿萨拉区域作业与口径（受限）' },
    { id: 'life',      name: '职场生活',      desc: '后勤、通勤、福利' },
    { id: 'anon',      name: '匿名建议',      desc: '仅记录部门，不记录工号' }
  ];

  /* ---------------- 初始主题（演示数据） ---------------- */
  const HOUR = 3600e3, DAY = 864e5;
  const T0 = Date.now();

  const SEED = [
    {
      id: 'T-24817', board: 'notice', pinned: true,
      title: '【集团通告】Q4 全员安全复训将于 10 月 12 日开始，全员必修',
      author: 'HK-086417', ts: T0 - 6 * HOUR,
      body: `各位同事：

按照集团 HQS 体系的年度要求，第四季度全员安全复训将于 10 月 12 日（周一）正式开放，10 月 30 日 24:00 截止。

要点如下：
1. 本次复训为【必修】，未完成将影响门禁权限与季度考核；
2. 课程共 4 个模块，预计总时长 95 分钟，支持分段完成；
3. 现场作业岗位（含外包驻场）需额外完成模块 5「高风险作业许可」；
4. 完成后系统自动写入培训档案，无需手工提交。

入口：员工门户 → 培训中心 → 2035-Q4 安全复训
如遇课程无法加载，请先联系本部门 IT 联络员，再提交工单，避免重复提交。`,
      replies: [
        { author: 'HK-023188', ts: T0 - 5 * HOUR, text: '现场岗的模块 5 这次是新增的吗？去年没看到这一项。' },
        { author: 'HK-086417', ts: T0 - 4.6 * HOUR, text: '是新增的。今年北海项目出了两起未遂事件，调查建议里明确要求强化作业许可培训，所以这次把模块 5 单列出来。' },
        { author: 'HK-114002', ts: T0 - 4.1 * HOUR, text: '补充一点：审计口径上，模块 5 的完成记录会作为现场检查的抽查项，请各区域负责人提前确认名单。' },
        { author: 'HK-201955', ts: T0 - 1.2 * HOUR, text: '试用期员工也需要完成吗？' },
        { author: 'HK-086417', ts: T0 - 40 * 60e3, text: '需要。试用期同样计入必修名单，但考核权重按入职时间折算，具体见门户说明。' }
      ]
    },
    {
      id: 'T-24793', board: 'tech',
      title: '新加坡算力园区二期液冷回路：回水温度波动 1.8℃ 的处理记录',
      author: 'HK-023188', ts: T0 - 2 * DAY,
      body: `上周二期 C 区投产后，监控发现液冷回路回水温度在负载爬坡阶段有 1.8℃ 的周期性波动（周期约 42 分钟）。

排查过程：
· 先排除负载因素 —— 同期 IT 负载平稳，波动与业务侧无相关性；
· 校验流量计与温度探头，误差在 ±0.2℃ 内，排除仪表问题；
· 最终定位到二次侧泵组的一台变频泵 PID 参数沿用了旧厂区整定值，响应偏慢，与另外两台形成拍频。

处理：按厂家建议把积分时间从 18s 调到 9s，微分时间保持 0，波动收敛到 0.3℃ 以内。
代价是泵组切换时的冲击略大，已在 SOP 里加了切换前手动降载的步骤。

想问下有没有同事遇到过类似的拍频问题？我把三台泵的整定值整理成表格了，需要可以私信。`,
      replies: [
        { author: 'HK-086417', ts: T0 - 1.7 * DAY, text: '这个案例建议同步到知识库的「暖通与液冷」分类，比在论坛里翻要方便，后续项目投标也用得上。' },
        { author: 'HK-023188', ts: T0 - 1.6 * DAY, text: '已经提交了，还在等知识库评审。' },
        { author: 'HK-114002', ts: T0 - 1.1 * DAY, text: '提醒：修改 PID 参数属于变更管理范畴，请确认变更单已归档。审计时会抽查「变更单 ↔ SOP 版本」是否对应。' },
        { author: 'HK-023188', ts: T0 - 1.05 * DAY, text: '变更单 CHG-2035-0938，已归档，SOP 升到 V3.2。' }
      ]
    },
    {
      id: 'T-24761', board: 'safety',
      title: '北海 4.2GW 项目海上作业：关于临近天气窗口的处置建议',
      author: 'HK-023188', ts: T0 - 3 * DAY,
      body: `北海项目的作业窗口越来越紧，这里想讨论一下「预报有 30% 概率超风速」时该不该照常出海。

我的看法：不要只看风速均值，要看阵风上限和撤离时间。按我们的撤离预案，从最远作业点返回母船需要 55 分钟，所以真正的判据应该是「未来 2 小时内阵风超过 18m/s 的概率」。

上周我们按这个口径取消了一次出海，事后天气并没有变差，有同事觉得浪费了窗口。但我认为这个成本远低于一次应急撤离。

欢迎有海上作业经验的同事补充。`,
      replies: [
        { author: 'HK-114002', ts: T0 - 2.8 * DAY, text: '从合规角度支持这个判断。安全与合规板块的原则是：取消作业不需要理由充分，恢复作业才需要。' },
        { author: 'HK-086417', ts: T0 - 2.5 * DAY, text: '建议把这个判据写成一条判定规则，纳入现场作业手册，避免每次靠个人判断。' },
        { author: 'HK-023188', ts: T0 - 2.4 * DAY, text: '同意，草稿我已经贴在知识库了，编号 KB-WIND-0051。' }
      ]
    },
    {
      id: 'T-24902', board: 'life',
      title: 'APAC-07 园区通勤班车 11 月起调整：新增两条线路',
      author: 'HK-086417', ts: T0 - 9 * HOUR,
      body: `因园区北门道路施工，11 月 1 日起班车线路调整：

· 新增 L7（西二旗 → 园区）、L8（望京 → 园区），早班 07:10 发车；
· 原 L2 线路终点由北门改到东门，行车时间预计增加 6 分钟；
· 施工期预计 4 个月，恢复后另行通知。

班车实时位置可在门户 → 后勤服务 里查看。
对线路有建议的，直接在本帖回复，我会统一汇总给后勤。`,
      replies: [
        { author: 'HK-201955', ts: T0 - 7 * HOUR, text: 'L8 能不能加一站？望京西地铁口那边住的人不少。' },
        { author: 'HK-086417', ts: T0 - 6.5 * HOUR, text: '记下了，这周一起提。不过加站要看运力，可能要等下个月。' }
      ]
    },
    {
      id: 'T-24888', board: 'anon', title: '关于跨部门工单流转太慢的一些想法',
      author: 'ANON', ts: T0 - 14 * HOUR,
      body: `提个建议，不针对具体人。

现在跨部门工单平均要 2~3 天才有第一次响应，但很多时候只是需要对方确认一个参数。建议：
1. 给工单加一个「仅需确认」类型，目标响应时间 4 小时；
2. 超过承诺时间未响应的，自动升级到上一级主管，而不是等提交人催。

不知道流程上有没有障碍，想听听大家怎么看。`,
      replies: [
        { author: 'HK-086417', ts: T0 - 12 * HOUR, text: '这个建议方向是对的，我们内部讨论过类似的。主要顾虑是自动升级会放大管理成本，但「仅需确认」这个类型确实值得先做。' },
        { author: 'HK-114002', ts: T0 - 11 * HOUR, text: '补充一个前提：升级规则要写清楚时间口径（自然时间还是工作时间），否则容易产生争议。' }
      ]
    },
    {
      id: 'T-24850', board: 'notice', title: '组织架构调整公示：算力与存储服务板块增设「工业数据治理」二级部门',
      author: 'HK-086417', ts: T0 - 4 * DAY,
      body: `经集团管理委员会决议，自 2035 年 11 月 1 日起：

· 算力与存储服务板块下设「工业数据治理」二级部门；
· 原数据平台组的资产目录、主数据、数据质量三条线整体划入该部门；
· 相关同事的汇报线将在 10 月 25 日前由 HRBP 逐一沟通确认。

公示期 7 天（至 10 月 11 日）。如有异议，可通过员工门户提交，或直接联系所在部门 HRBP。`,
      replies: [
        { author: 'HK-201955', ts: T0 - 3.5 * DAY, text: '想确认一下，数据平台组的实习生会跟着一起划过去吗？' },
        { author: 'HK-086417', ts: T0 - 3.4 * DAY, text: '会。实习生一并划转，汇报线同样由 HRBP 沟通。' }
      ]
    },
    {
      id: 'T-24866', board: 'tech', title: '求助：设备台账导入时字段映射一直失败',
      author: 'HK-201955', ts: T0 - 20 * HOUR,
      body: `在门户里导入设备台账，提示「字段映射失败：asset_tag 重复」。

我检查过源文件，asset_tag 这一列没有重复值。是不是导入模板要求的格式和我用的不一样？模板里 asset_tag 举例是 HK-AS-000123 这种格式，我用的是纯数字。

有同事遇到过吗？`,
      replies: [
        { author: 'HK-114002', ts: T0 - 18 * HOUR, text: '纯数字会被系统判定为空值，因为 asset_tag 的校验规则要求前缀。改成 HK-AS- 开头再试。' },
        { author: 'HK-201955', ts: T0 - 17 * HOUR, text: '改完就成功了，谢谢！' }
      ]
    },
    {
      id: 'T-24841', board: 'safety', title: '【安全通告】关于仿冒钓鱼邮件的最新特征与处置流程',
      author: 'HK-114002', ts: T0 - 5 * DAY,
      body: `近期出现一批仿冒「集团采购系统」的钓鱼邮件，特征如下：

· 发件人显示名为「Haavk Procurement」，但实际域名不是集团域名；
· 正文要求点击链接「确认供应商资质更新」；
· 附件为 .html 文件，打开后是仿冒的登录页。

处置流程：
1. 不要点击链接或打开附件；
2. 通过邮件客户端「举报钓鱼」按钮上报；
3. 如已输入口令，立即在门户修改口令并提交工单，我们会强制下线该会话。

本月已拦截 37 封，请各位保持警惕。`,
      replies: [
        { author: 'HK-086417', ts: T0 - 4.6 * DAY, text: '已转发到部门群。建议把这批特征同步给外包驻场同事，他们对外部邮件更敏感。' },
        { author: 'HK-114002', ts: T0 - 4.5 * DAY, text: '好的，下周会出一份简版给驻场同事。' }
      ]
    },
    {
      id: 'T-24911', board: 'life', title: '食堂三楼新窗口试运营，征求口味反馈',
      author: 'HK-086417', ts: T0 - 2 * HOUR,
      body: `食堂三楼本周新开一个窗口（川湘风味），试运营两周。

反馈直接在这帖回复即可，我会转给后勤。特别想知道：
· 辣度是否需要分级？
· 出餐速度（目前高峰期约 6 分钟）能否接受？`,
      replies: [
        { author: 'HK-023188', ts: T0 - 1.5 * HOUR, text: '辣度一定要分级，现在的默认辣度对外地同事不太友好。' },
        { author: 'HK-201955', ts: T0 - 1 * HOUR, text: '出餐速度可以接受，比原来那个窗口快。' }
      ]
    },
    {
      id: 'T-24803', board: 'tech', title: '关于 HQS 审计中「文档版本一致性」的常见扣分项整理',
      author: 'HK-114002', ts: T0 - 6 * DAY,
      body: `最近几次内审，发现在「文档版本一致性」上大家反复踩同样的坑，整理一份清单：

1. 现场张贴的作业指导书版本低于系统里的最新版 —— 最高频问题；
2. SOP 修改后未同步更新对应的培训材料；
3. 变更单关闭了，但受影响的图纸没有升版；
4. 纸质记录表与电子模板字段不一致（通常是电子版加了字段，纸质没换）。

建议各部门在每次变更关闭时，多问一句「还有哪些地方引用了这份文件」。
需要的话我可以把这份清单做成检查表模板。`,
      replies: [
        { author: 'HK-086417', ts: T0 - 5.7 * DAY, text: '做成检查表吧，很实用。放到知识库「合规工具」分类下。' },
        { author: 'HK-023188', ts: T0 - 5.5 * DAY, text: '我们现场这边第 1 条确实常见，主要是换版后没人负责撕旧的。现在已经改成换版当天由班组长确认。' },
        { author: 'HK-114002', ts: T0 - 5.2 * DAY, text: '这个做法很好，我会写进下季度的最佳实践通报里。' }
      ]
    },
    {
      id: 'T-24925', board: 'notice', title: '【内部】reilink 项目第三阶段受试者招募启动，仅限内部通道',
      author: 'HK-086417', ts: T0 - 5 * HOUR,
      body: `生命科学与医疗板块 · 神经工程组通知：

第三阶段受试者招募自即日起启动，补偿标准按集团《受试者补偿细则（2035 版）》执行，入组评估统一在巴别塔医疗中心完成。

请特别注意以下三点：
1. 招募信息仅限内部参考，禁止转发至任何外部渠道、社交媒体或家属群；
2. 对外统一口径为「神经康复辅助设备公开研究」，不得使用「脑机接口临床试验」等表述；
3. 涉及受试者个人信息的材料，一律通过内部档案系统流转，不得使用个人邮箱或移动存储。

项目组联系人：生命科学与医疗板块 · 神经工程组（内线 4300）`,
      replies: [
        { author: 'HK-114002', ts: T0 - 4.4 * HOUR, text: '补充口径提醒：如遇外部媒体或合作方询问，请转交集团传播事务归口答复，不要自行解释试验范围与补偿方案。' },
        { author: 'HK-023188', ts: T0 - 4.1 * HOUR, text: '我在 EMEA-02 也收到转发的招募通知了，海外的同事是通过同一个通道报名吗？' },
        { author: 'HK-086417', ts: T0 - 3.8 * HOUR, text: '是。海外报名同样走内部通道，由项目组统一安排行程与评估，不要自行联系本地医疗机构。' }
      ]
    },
    {
      id: 'T-24918', board: 'notice', title: '【效率部门】Q4 起推行「效率至上」考核：末位复核流程说明',
      author: 'HK-086417', ts: T0 - 1.1 * DAY,
      body: `效率部门通知：自 10 月 1 日起，各基地与职能中心按季度提交人效与流程周期数据。

要点：
· 考核指标包括人均交付量、流程平均周期、返工率三项；
· 连续两个季度排名末位的团队进入复核流程，由效率部门与所属板块共同确认调整方案；
· 复核结果可能涉及岗位调整、驻场安排变更或转岗培训。

本季度数据提交截止 10 月 20 日。对指标口径有疑问的，请在 portal 提交工单，标注「效率考核口径」。`,
      replies: [
        { author: 'HK-023188', ts: T0 - 1 * DAY, text: '现场作业的返工率怎么算？天气窗口取消出海导致的计划变更，应该不算返工吧？' },
        { author: 'HK-086417', ts: T0 - 22 * HOUR, text: '口径里写的是「因执行质量问题导致的返工」，天气与不可抗力不计入。有异议可以按工单渠道复核，效率部门会统一答复。' },
        { author: 'ANON', ts: T0 - 20 * HOUR, text: '说句实话，把人效和流程周期直接排名，最先被砍的往往是安全冗余和复核环节。希望复核流程里能有人替现场说话。' }
      ]
    },
    {
      id: 'T-24904', board: 'ash', title: 'ASH-01 现场纪律提醒：作业区外围警戒与对外口径',
      author: 'HK-023188', ts: T0 - 3.2 * DAY,
      body: `刚从乌姆河项目现场回来，记录几条容易踩线的做法：

· 矿区外围警戒区（蓝桩以南 800 米）任何情况下不得带外人进入，包括本地合作方随行人员；
· 涉及地表水与地下水位的问题，现场一律不作解释，登记问询人信息后转区域事务联络组；
· 补偿标准相关材料不得在现场张贴，也不得拍照留存。

上个月有外包司机在临时堆场拍了短视频，后来被安全部门约谈。这不是小题大做，请大家务必遵守。`,
      replies: [
        { author: 'HK-114002', ts: T0 - 3 * DAY, text: '补充：现场影像资料一律由区域事务联络组统一管理。个人设备拍摄作业区属于违规，审计会按信息安全事件处理。' },
        { author: 'HK-086417', ts: T0 - 2.7 * DAY, text: '已把这三条加进《ASH-01 区域对外沟通口径》V1.6，编号 COM-ASH-0007，区域授权后可查。' },
        { author: 'HK-201955', ts: T0 - 2.5 * DAY, text: '问一个流程问题：如果当地居民直接来营地反映用水问题，我们需要登记哪些信息？' },
        { author: 'HK-086417', ts: T0 - 2.4 * DAY, text: '按联络组的《外部问询登记表》：来访时间、人数、诉求摘要、是否留有联系方式，四项即可，不要自行承诺任何补偿或工期。' }
      ]
    },
    {
      id: 'T-24899', board: 'safety', title: '【安全部门通报】近期出现针对集团设施的第三方情报活动',
      author: 'HK-114002', ts: T0 - 4.2 * DAY,
      body: `安全部门通报：

近两个月接报多起外部组织在阿萨拉、长弓溪谷与巴克什周边对集团设施进行测绘、拍摄与人员接触的情况。特征包括：
· 以地质调查、纪录片拍摄、学术访谈名义接触驻场人员；
· 询问设施进出路线、班次安排、承重与供电能力；
· 使用带定向天线的小型设备在设施外围长时间停留。

处置要求：
1. 不与对方发生直接冲突，不透露任何运营信息；
2. 记录人员特征、车辆牌照与时间点，通过安全部门专线（内线 4100）上报；
3. 不要在论坛、社交媒体或私下传播相关情况。

涉及 GTI 相关背景的问询，一律转安全部门归口处理。`,
      replies: [
        { author: 'HK-023188', ts: T0 - 4 * DAY, text: '这个和上周现场遇到的情况能对上。当时对方说是做地下水课题的学生，但问的问题更关心我们的泵站供电。' },
        { author: 'HK-114002', ts: T0 - 3.9 * DAY, text: '请把时间和地点发给安全部门专线，我们已经收到三起类似报告，正在做交叉比对。' }
      ]
    },
    {
      id: 'T-24882', board: 'tech', title: '曼德尔砖机柜上架：APAC-07 二期的供电与承重实测数据',
      author: 'HK-201955', ts: T0 - 1.8 * DAY,
      body: `参与了 APAC-07 二期 A 区的曼德尔砖上架，记录几组实测数据供参考：

· 单机柜整机重量 1.42 t，含配重与液冷快接头；
· 满载 1.6 PFLOPS 规格下的机柜级功耗约 48 kW，峰值出现在整点调度窗口；
· 相变存储层的维护窗口建议安排在算力配额低谷，跨区调度一次大约需要 12 分钟。

我们遇到的主要问题是地板开孔位置与原有线槽冲突，最后把快接头改到柜体后侧。`,
      replies: [
        { author: 'HK-023188', ts: T0 - 1.7 * DAY, text: '供电这块可以同步给能源板块，48 kW 的机柜密度对 UPS 分级有影响，我们这边做液冷回路负荷测算时要一起算。' },
        { author: 'HK-114002', ts: T0 - 1.6 * DAY, text: '上架前的变更单记得归档，算力配额发布也要走 SOP-MAN-0102 的审批链。' }
      ]
    },
    {
      id: 'T-24871', board: 'life', title: 'ASH-01 驻场补贴上调了，但家属探视怎么安排？',
      author: 'HK-023188', ts: T0 - 2.2 * DAY,
      body: `区域补贴从本月起上调到每天 380 元，长期驻场（超过 90 天）另有一档。这个没问题。

但探视安排一直不明确：营地到最近的城镇要 3 小时车程，家属过来基本要走审批，周期还挺长。有没有同事走过这个流程？大概多久能批下来？`,
      replies: [
        { author: 'HK-086417', ts: T0 - 2 * DAY, text: '走后勤 + 安全部门双签。安全部门会做一次区域风险评估，正常情况下 5 个工作日，雨季可能延长。' },
        { author: 'HK-023188', ts: T0 - 1.9 * DAY, text: '明白了。还有个问题：家属到营地之后能不能进生活区以外的地方？' },
        { author: 'HK-086417', ts: T0 - 1.8 * DAY, text: '不能。只允许在生活区与接待区活动，作业区与堆场一律不行，这一点安全部门的批文里会写明。' }
      ]
    }
  ];

  /* ---------------- 状态 ---------------- */
  const S = {
    me: null,
    board: 'all',
    sort: 'last',
    q: '',
    threads: [],
    liked: store.get('liked', {}),
    view: null
  };

  /* ---------------- 持久化 ---------------- */
  function loadThreads() {
    const user = store.get('threads', null);
    const seeded = SEED.map(t => ({ ...t, replies: t.replies.slice() }));
    if (user && Array.isArray(user) && user.length) {
      // 用户发的内容追加在种子数据之后
      S.threads = seeded.concat(user);
    } else {
      S.threads = seeded;
    }
  }
  function saveUserThreads() {
    const seedIds = new Set(SEED.map(t => t.id));
    const only = S.threads.filter(t => !seedIds.has(t.id));
    store.set('threads', only);
  }

  /* ---------------- 工具 ---------------- */
  const emp = id => EMPLOYEES[id] || null;
  function displayName(id) {
    if (id === 'ANON') return '匿名同事';
    const e = emp(id);
    return e ? `${e.name}` : id;
  }
  function roleBadge(id) {
    if (id === 'ANON') return `<span class="role role-guest">匿名</span>`;
    const e = emp(id);
    if (!e) return `<span class="role role-guest">外部</span>`;
    const cls = { admin: 'role-admin', core: 'role-core', intern: 'role-intern', audit: 'role-admin' }[e.role] || '';
    return `<span class="role ${cls}">${esc(e.roleText)}</span>`;
  }
  function initials(name) { return name.slice(0, 1); }
  const replyCount = t => t.replies.length;
  function lastTs(t) { return t.replies.length ? Math.max(t.ts, ...t.replies.map(r => r.ts)) : t.ts; }

  /* ---------------- 渲染：板块列表 ---------------- */
  function renderBoards() {
    const ul = document.getElementById('board-list');
    ul.innerHTML = BOARDS.map(b => {
      const n = b.id === 'all' ? S.threads.length : S.threads.filter(t => t.board === b.id).length;
      return `<li class="${S.board === b.id ? 'on' : ''}" data-board="${b.id}">
        <span>${esc(b.name)}</span><span class="cnt">${n}</span></li>`;
    }).join('');
    ul.querySelectorAll('li').forEach(li => {
      li.onclick = () => { S.board = li.dataset.board; S.view = null; render(); };
    });
  }

  /* ---------------- 渲染：我的信息 ---------------- */
  function renderMe() {
    const box = document.getElementById('me-card');
    const nav = document.getElementById('nav-user');
    if (!S.me) { box.innerHTML = ''; nav.innerHTML = ''; return; }
    const e = emp(S.me);
    box.innerHTML = `
      <div class="me-top">
        <div class="avatar">${esc(initials(e.name))}</div>
        <div>
          <div class="me-name">${esc(e.name)} ${roleBadge(S.me)}</div>
          <div class="me-meta">${esc(e.title)}</div>
        </div>
      </div>
      <div class="me-rows">
        <div><span class="mut">工号</span><span class="v">${esc(S.me)}</span></div>
        <div><span class="mut">部门</span><span class="v">${esc(e.dept)}</span></div>
        <div><span class="mut">区域</span><span class="v">${esc(e.region)}</span></div>
        <div><span class="mut">司龄</span><span class="v">${e.years} 年</span></div>
      </div>
      <button class="btn btn-sm mt16" style="width:100%;justify-content:center" id="btn-logout">退出登录</button>`;
    document.getElementById('btn-logout').onclick = () => {
      store.del('me'); S.me = null; location.reload();
    };
    nav.innerHTML = `
      <span class="small mut" style="margin-right:4px">${esc(e.name)}</span>
      <span class="avatar" style="width:30px;height:30px;font-size:13px">${esc(initials(e.name))}</span>`;
    nav.querySelector('.avatar').title = `${e.name} · ${S.me}`;
    nav.querySelector('.avatar').onclick = () => toast(`工号 ${S.me} · ${e.dept} · ${e.title}`);
  }

  /* ---------------- 渲染：在线成员 ---------------- */
  function renderOnline() {
    const ul = document.getElementById('online-list');
    const list = [
      ['HK-086417', ''], ['HK-023188', ''], ['HK-114002', 'idle'], ['HK-201955', '']
    ];
    ul.innerHTML = list.map(([id, st]) => {
      const e = emp(id);
      return `<li><span class="dot ${st}"></span>${esc(e.name)} · ${esc(e.dept)}</li>`;
    }).join('') + `<li><span class="dot off"></span>另有 46 人在线</li>`;
  }

  /* ---------------- 渲染：主题列表 ---------------- */
  function filtered() {
    let arr = S.threads.slice();
    if (S.board !== 'all') arr = arr.filter(t => t.board === S.board);
    if (S.sort === 'mine') arr = arr.filter(t => t.author === S.me);
    if (S.q) {
      const q = S.q.toLowerCase();
      arr = arr.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q) ||
        displayName(t.author).toLowerCase().includes(q)
      );
    }
    if (S.sort === 'last') arr.sort((a, b) => (b.pinned - a.pinned) || (lastTs(b) - lastTs(a)));
    else if (S.sort === 'new') arr.sort((a, b) => (b.pinned - a.pinned) || (b.ts - a.ts));
    else if (S.sort === 'hot') arr.sort((a, b) => (b.pinned - a.pinned) || (replyCount(b) - replyCount(a)));
    else arr.sort((a, b) => b.ts - a.ts);
    return arr;
  }

  function renderThreads() {
    const box = document.getElementById('threads');
    const arr = filtered();
    document.getElementById('empty').hidden = arr.length > 0;
    box.innerHTML = arr.map(t => {
      const b = BOARDS.find(x => x.id === t.board);
      const e = emp(t.author);
      const excerpt = t.body.replace(/\s+/g, ' ').slice(0, 90);
      return `<article class="thread ${t.pinned ? 'pinned' : ''}" data-id="${t.id}">
        <div class="avatar" title="${esc(displayName(t.author))}">${esc(t.author === 'ANON' ? '匿' : (e ? initials(e.name) : '?'))}</div>
        <div>
          <div class="thread-title">${t.pinned ? '<span class="pin">置顶</span>' : ''}${esc(t.title)}</div>
          <div class="thread-excerpt">${esc(excerpt)}…</div>
          <div class="thread-meta">
            <span class="who">${esc(displayName(t.author))}</span>
            ${roleBadge(t.author)}
            <span>·</span><span>${esc(b ? b.name : t.board)}</span>
            <span>·</span><span>${fmt(t.ts)}</span>
            <span>·</span><span class="mono">${t.id}</span>
          </div>
        </div>
        <div class="thread-stats">
          <div><b>${replyCount(t)}</b> 回复</div>
          <div>${ago(lastTs(t))}</div>
        </div>
      </article>`;
    }).join('');
    box.querySelectorAll('.thread').forEach(el => {
      el.onclick = () => { S.view = el.dataset.id; render(); window.scrollTo({ top: 200, behavior: 'smooth' }); };
    });
  }

  /* ---------------- 渲染：详情 ---------------- */
  function renderDetail() {
    const box = document.getElementById('detail');
    if (!S.view) { box.hidden = true; box.innerHTML = ''; return; }
    const t = S.threads.find(x => x.id === S.view);
    if (!t) { box.hidden = true; return; }
    const b = BOARDS.find(x => x.id === t.board);
    const canReply = S.me && (t.board !== 'anon' || true);

    const postHtml = (author, ts, text, isOp, idx) => {
      const e = emp(author);
      const liked = !!S.liked[t.id + ':' + idx];
      return `<div class="post ${isOp ? 'op' : ''}">
        <div class="avatar" title="${esc(displayName(author))}">${esc(author === 'ANON' ? '匿' : (e ? initials(e.name) : '?'))}</div>
        <div class="post-body">
          <div class="post-head">
            <span class="post-author">${esc(displayName(author))}</span>
            ${roleBadge(author)}
            ${isOp ? '<span class="floor op">楼主</span>' : `<span class="floor">${idx} 楼</span>`}
            <span class="post-time">${fmt(ts)}</span>
          </div>
          <div class="post-text">${esc(text)}</div>
          <div class="post-foot">
            <button class="like ${liked ? 'liked' : ''}" data-like="${idx}">▲ <span>${liked ? '已赞同' : '赞同'}</span></button>
            ${isOp ? '' : `<button data-quote="${idx}">引用回复</button>`}
          </div>
        </div>
      </div>`;
    };

    box.hidden = false;
    box.innerHTML = `
      <div class="detail-head">
        <div class="detail-back" id="d-back">← 返回主题列表</div>
        <h2>${t.pinned ? '<span class="pin">置顶</span>' : ''}${esc(t.title)}</h2>
        <div class="thread-meta">
          <span class="who">${esc(displayName(t.author))}</span>
          ${roleBadge(t.author)}
          <span>·</span><span>${esc(b ? b.name : t.board)}</span>
          <span>·</span><span>${fmt(t.ts)}</span>
          <span>·</span><span class="mono">${t.id}</span>
          <span>·</span><span>${replyCount(t)} 条回复</span>
        </div>
      </div>
      ${postHtml(t.author, t.ts, t.body, true, 0)}
      ${t.replies.map((r, i) => postHtml(r.author, r.ts, r.text, false, i + 1)).join('')}
      <div class="reply">
        <textarea id="r-text" rows="3" placeholder="回复主题…（支持换行，会记录你的工号）"></textarea>
        <div class="reply-bar">
          <span class="reply-hint">当前身份：${esc(displayName(S.me))} · ${esc(S.me)}　${t.board === 'anon' ? '本板块仅记录部门，不记录工号' : ''}</span>
          <button class="btn btn-primary btn-sm" id="r-send">发表回复</button>
        </div>
      </div>`;

    document.getElementById('d-back').onclick = () => { S.view = null; render(); };
    box.querySelectorAll('[data-like]').forEach(b2 => {
      b2.onclick = () => {
        const k = t.id + ':' + b2.dataset.like;
        S.liked[k] = !S.liked[k];
        store.set('liked', S.liked);
        renderDetail();
      };
    });
    box.querySelectorAll('[data-quote]').forEach(b2 => {
      b2.onclick = () => {
        const i = +b2.dataset.quote;
        const r = t.replies[i - 1];
        const ta = document.getElementById('r-text');
        ta.value = `> ${displayName(r.author)}：${r.text.split('\n')[0]}\n\n`;
        ta.focus();
      };
    });
    const send = document.getElementById('r-send');
    send.onclick = () => {
      const ta = document.getElementById('r-text');
      const v = ta.value.trim();
      if (!v) { toast('回复内容不能为空'); ta.focus(); return; }
      if (!S.me) { toast('请先登录'); return; }
      t.replies.push({ author: t.board === 'anon' ? S.me : S.me, ts: Date.now(), text: v });
      saveUserThreads();
      toast('回复已提交，已记入审计日志');
      render();
    };
  }

  /* ---------------- 渲染总入口 ---------------- */
  function render() {
    renderBoards();
    renderMe();
    renderOnline();

    // 详情模式下隐藏列表与工具栏，反之亦然
    const inDetail = !!S.view;
    document.querySelector('.feed-bar').style.display = inDetail ? 'none' : 'flex';
    if (inDetail) document.getElementById('compose').hidden = true;
    document.getElementById('threads').style.display = inDetail ? 'none' : 'block';
    document.getElementById('empty').hidden = true;

    if (inDetail) renderDetail(); else { document.getElementById('detail').hidden = true; renderThreads(); }

    document.getElementById('st-threads').textContent = S.threads.length;
    document.getElementById('st-replies').textContent = S.threads.reduce((a, t) => a + t.replies.length, 0);
    document.getElementById('st-online').textContent = 50;
  }

  /* ---------------- 发帖 ---------------- */
  function initCompose() {
    const box = document.getElementById('compose');
    const sel = document.getElementById('c-board');
    sel.innerHTML = BOARDS.filter(b => b.id !== 'all')
      .map(b => `<option value="${b.id}">${esc(b.name)}</option>`).join('');

    const open = () => { box.hidden = false; document.getElementById('c-title').focus(); };
    const close = () => { box.hidden = true; };

    document.getElementById('btn-new').onclick = () => {
      if (!S.me) { toast('请先登录后再发帖'); return; }
      open();
    };
    document.getElementById('compose-close').onclick = close;
    document.getElementById('compose-cancel').onclick = close;

    document.getElementById('compose-submit').onclick = () => {
      const board = sel.value;
      const title = document.getElementById('c-title').value.trim();
      const body = document.getElementById('c-body').value.trim();
      if (title.length < 4) { toast('标题至少 4 个字'); return; }
      if (body.length < 8) { toast('正文至少 8 个字'); return; }
      const id = 'T-' + Math.floor(25000 + Math.random() * 900);
      const t = {
        id, board, title, author: board === 'anon' ? 'ANON' : S.me,
        ts: Date.now(), body, replies: [], pinned: false
      };
      S.threads.unshift(t);
      saveUserThreads();
      document.getElementById('c-title').value = '';
      document.getElementById('c-body').value = '';
      close();
      S.board = board; S.view = id;
      render();
      toast('主题已发布');
    };
  }

  /* ---------------- 登录 ---------------- */
  function initAuth() {
    const mask = document.getElementById('auth');
    const go = () => {
      const id = document.getElementById('a-id').value.trim().toUpperCase();
      const pw = document.getElementById('a-pw').value;
      if (!/^HK-\d{6}$/.test(id)) { toast('工号格式应为 HK- 加 6 位数字'); return; }
      if (!pw) { toast('请输入口令'); return; }
      if (!EMPLOYEES[id]) { toast('该工号不在演示名单内，请使用下方列出的工号'); return; }
      store.set('me', id);
      S.me = id;
      mask.hidden = true;
      render();
      toast(`欢迎回来，${EMPLOYEES[id].name}`);
    };
    document.getElementById('a-go').onclick = go;
    document.getElementById('a-pw').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    document.getElementById('a-id').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });

    const saved = store.get('me', null);
    const auto = (new URLSearchParams(location.search).get('demo') || '').toUpperCase();
    if (auto && EMPLOYEES[auto]) { store.set('me', auto); S.me = auto; mask.hidden = true; }
    else if (saved && EMPLOYEES[saved]) { S.me = saved; mask.hidden = true; }
    else mask.hidden = false;
  }

  /* ---------------- 启动 ---------------- */
  function start() {
    loadThreads();
    initAuth();
    initCompose();
    render();

    // 排序
    document.getElementById('sorts').addEventListener('click', e => {
      const b = e.target.closest('.chip');
      if (!b) return;
      S.sort = b.dataset.sort;
      document.querySelectorAll('#sorts .chip').forEach(c => c.classList.toggle('on', c === b));
      S.view = null;
      render();
    });

    // 搜索
    let tmr;
    document.getElementById('q').addEventListener('input', e => {
      clearTimeout(tmr);
      tmr = setTimeout(() => { S.q = e.target.value.trim(); S.view = null; render(); }, 160);
    });

    document.getElementById('lnk-audit').onclick = e => {
      e.preventDefault();
      toast('审计日志：演示环境不产生真实记录');
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
