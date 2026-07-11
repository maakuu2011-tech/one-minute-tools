const tool = JSON.parse(document.getElementById("tool-data").textContent);

const state = {
  tone: "polite",
  length: "short",
};

const el = {
  incoming: document.getElementById("incoming"),
  incomingLabel: document.getElementById("incomingLabel"),
  purpose: document.getElementById("purpose"),
  relationship: document.getElementById("relationship"),
  detail: document.getElementById("detail"),
  detailLabel: document.getElementById("detailLabel"),
  output: document.getElementById("output"),
  toast: document.getElementById("toast"),
};

const categoryDefaults = {
  "断り方": { purpose: "decline", detail: "今回は対応が難しいため、失礼のない形で断りたい。" },
  "催促": { purpose: "remind", detail: "確認状況を知りたいので、返信をお願いしたい。" },
  "言い換え": { purpose: "rewrite", detail: "相手にきつく見えない、やわらかい表現にしたい。" },
  "謝罪": { purpose: "apology", detail: "迷惑をかけたことを謝り、次の対応を伝えたい。" },
  "お礼": { purpose: "thanks", detail: "対応してもらったことへの感謝と、次の対応を伝えたい。" },
  "チャット": { purpose: "reply", detail: "短く自然に返したい。" },
  "日程調整": { purpose: "request", detail: "候補日を伝えて、都合の良い日時を確認したい。" },
  "依頼": { purpose: "request", detail: "無理のない範囲で対応をお願いしたい。" },
  "連絡": { purpose: "reply", detail: "状況と次の対応を、簡潔に伝えたい。" },
  "返信": { purpose: "reply", detail: "問い合わせへの返信として、丁寧に対応したい。" },
  "報告": { purpose: "report", detail: "現在の状況、影響、次にやることを簡潔に報告したい。" },
  "メール": { purpose: "reply", detail: "用件が伝わるよう、丁寧なメール文にしたい。" },
};

const toolProfiles = {
  "invitation-decline": {
    purpose: "decline", relationship: "friend", includeSubject: false, useIncoming: false,
    incomingLabel: "誘われた内容", detailLabel: "断る理由・代わりの提案",
    incomingPlaceholder: "例：今週金曜の飲み会に誘われた", detailPlaceholder: "例：先約がある。次回は参加したい",
    templates: [
      ["飲み会を断る", "今週金曜の飲み会に誘ってもらいました。", "先約があるため今回は参加できません。次回はぜひ参加したいです。"],
      ["急な誘いを断る", "今日これから会おうと誘われました。", "今日は難しいですが、来週なら予定を合わせられます。"],
      ["日程が合わない", "休日のイベントに誘ってもらいました。", "その日は予定があります。誘ってくれてありがとうございます。"],
    ],
  },
  "sales-dm-decline": {
    purpose: "decline", relationship: "unknown", includeSubject: false, useIncoming: false,
    incomingLabel: "届いた営業メッセージの内容", detailLabel: "断りたい理由・今後の希望",
    incomingPlaceholder: "例：サービスのオンライン説明を提案された", detailPlaceholder: "例：現在は導入予定がない。今後の連絡も不要",
    templates: [
      ["営業提案を断る", "新しいサービスの案内と面談の提案をいただきました。", "現在は導入予定がないため、今回は見送ります。"],
      ["資料だけ受け取る", "サービス説明の打ち合わせを提案されました。", "今は打ち合わせが難しいため、資料のみ送ってほしいです。"],
      ["今後の連絡を断る", "継続的に営業の連絡が届いています。", "検討予定がないため、今後のご案内は不要です。"],
    ],
  },
  "reply-reminder": {
    purpose: "remind", relationship: "work", subject: "ご返信のお願い",
    incomingLabel: "返信を待っている内容", detailLabel: "希望する返信時期・補足",
    incomingPlaceholder: "例：先週送った日程確認メール", detailPlaceholder: "例：明日までに都合のよい日を教えてほしい",
    templates: [
      ["返信を確認する", "先週お送りした日程確認についてご連絡します。", "明日までに都合のよい日時を教えていただきたいです。"],
      ["社内で確認する", "申請内容について確認をお願いしています。", "次の作業に必要なため、本日中に返信をお願いしたいです。", "work"],
      ["やわらかく再連絡", "以前お送りした資料について確認状況を伺いたいです。", "急ぎではありません。今週中を目安に一度返信をいただきたいです。", "work", "soft"],
    ],
  },
  "client-reminder": {
    purpose: "remind", relationship: "client", subject: "ご確認状況について",
    incomingLabel: "取引先に確認したい内容", detailLabel: "期限・こちらの事情",
    incomingPlaceholder: "例：提出した見積書の確認状況", detailPlaceholder: "例：発注準備のため金曜までに回答がほしい",
    templates: [
      ["見積書の確認", "先日お送りした見積書について、確認状況を伺いたいです。", "準備の都合上、金曜までにご回答いただけると助かります。", "client"],
      ["原稿確認を催促", "確認をお願いしている原稿について再度ご連絡します。", "修正作業のため、明日午前中までにご意見をいただきたいです。", "client"],
      ["期限を決めず確認", "以前ご相談した件について、現在の状況を伺いたいです。", "行き違いでしたら申し訳ありません。ご都合のよいときに返信をお願いします。", "client", "soft"],
    ],
  },
  "harsh-to-soft": {
    purpose: "rewrite", relationship: "work", includeSubject: false,
    incomingLabel: "やわらかくしたい文章", detailLabel: "残したい要点・相手への配慮",
    incomingPlaceholder: "例：まだ終わっていないのですか。早くしてください", detailPlaceholder: "例：今日中に進捗だけ知りたい",
    templates: [
      ["強い催促", "まだ終わっていないのですか。早くしてください。", "今日中に進捗だけ確認したいです。"],
      ["きつい指摘", "説明が分かりにくいので、ちゃんと直してください。", "要点を整理して修正してほしいです。"],
      ["断定をやわらげる", "この方法では無理です。別の案にしてください。", "難しい理由を伝え、別案を相談したいです。"],
    ],
  },
  "casual-converter": {
    purpose: "rewrite", relationship: "friend", includeSubject: false,
    incomingLabel: "自然なタメ口にしたい文章", detailLabel: "雰囲気・補足",
    incomingPlaceholder: "例：ご都合のよい日時をお知らせください", detailPlaceholder: "例：親しい友達に送る。軽い雰囲気",
    templates: [
      ["日程を聞く", "ご都合のよい日時をお知らせいただけますでしょうか。", "親しい友達に、空いている日を聞きたいです。"],
      ["お礼を伝える", "先日はご対応いただき、誠にありがとうございました。", "友達に自然な感じでお礼を言いたいです。"],
      ["お願いする", "可能でしたら、こちらをご確認いただけますと幸いです。", "同僚にチャットで軽く確認をお願いしたいです。", "friend", "casual"],
    ],
  },
  "meeting-thanks": {
    purpose: "thanks", relationship: "client", subject: "本日のお打ち合わせのお礼",
    incomingLabel: "打ち合わせの内容", detailLabel: "特に感謝したいこと・次の対応",
    incomingPlaceholder: "例：新商品の導入について打ち合わせした", detailPlaceholder: "例：詳しい説明へのお礼。来週までに資料を送る",
    templates: [
      ["取引先へお礼", "本日は新商品の導入についてお打ち合わせいただきました。", "詳しくご説明いただき、ありがとうございました。来週までに検討結果をご連絡します。", "client"],
      ["商談後のお礼", "本日はサービスのご提案の時間をいただきました。", "課題に合わせてご提案いただき、ありがとうございました。社内で検討のうえ、改めてご連絡します。", "client"],
      ["社内会議のお礼", "本日は企画会議に参加してもらいました。", "多くの意見をいただき、ありがとうございました。修正版は明日共有します。", "work"],
    ],
  },
  "interview-thanks": {
    purpose: "thanks", relationship: "unknown", subject: "面接のお礼",
    incomingLabel: "面接・面談の内容", detailLabel: "印象に残ったこと・伝えたい意欲",
    incomingPlaceholder: "例：本日、一次面接を受けた", detailPlaceholder: "例：仕事内容の説明へのお礼。入社意欲が高まった",
    templates: [
      ["面接後のお礼", "本日、一次面接の機会をいただきました。", "仕事内容を詳しくご説明いただき、ありがとうございました。お話を伺い、志望意欲がさらに高まりました。", "unknown"],
      ["カジュアル面談", "本日、オンライン面談で事業について伺いました。", "質問へ率直にお答えいただき、ありがとうございました。", "unknown", "soft"],
      ["最終面接後", "本日、最終面接のお時間をいただきました。", "これまで選考の機会をいただき、ありがとうございます。改めて入社を希望しております。", "unknown", "polite", "long"],
    ],
  },
  "slack-reply": {
    purpose: "reply", relationship: "work", includeSubject: false, useIncoming: false,
    incomingLabel: "届いたSlackメッセージ", detailLabel: "返信で伝えたいこと",
    incomingPlaceholder: "例：今日中に資料を確認できますか？", detailPlaceholder: "例：15時までに確認して返信する",
    templates: [
      ["確認依頼へ返信", "今日中に資料を確認できますか？", "15時までに確認して返信します。", "work", "casual"],
      ["作業依頼へ返信", "明日の会議までに数字を更新してほしいです。", "承知しました。本日中に更新します。", "work", "casual"],
      ["すぐ対応できない", "急ぎで確認してほしいと連絡がありました。", "現在は別作業中のため、17時ごろに確認します。", "work", "soft"],
    ],
  },
  "teams-reply": {
    purpose: "reply", relationship: "work", includeSubject: false, useIncoming: false,
    incomingLabel: "届いたTeamsメッセージ", detailLabel: "返信で伝えたいこと",
    incomingPlaceholder: "例：明日の会議に参加できますか？", detailPlaceholder: "例：参加できる。資料も事前に確認する",
    templates: [
      ["会議参加を返信", "明日の会議に参加できますか？", "参加できます。共有された資料も事前に確認します。", "work", "casual"],
      ["確認完了を返信", "資料を確認してコメントしてほしいです。", "確認が完了し、2点コメントを入れました。", "work"],
      ["対応時刻を伝える", "この件を今日中に対応できますか？", "16時ごろから着手し、18時までに結果を共有します。", "work", "soft"],
    ],
  },
  "dm-reply": {
    purpose: "reply", relationship: "unknown", includeSubject: false, useIncoming: false,
    incomingLabel: "届いたDM", detailLabel: "返信で伝えたいこと",
    incomingPlaceholder: "例：商品について詳しく教えてください", detailPlaceholder: "例：問い合わせへのお礼。詳細ページを案内する",
    templates: [
      ["問い合わせ返信", "商品について詳しく教えてください。", "お問い合わせありがとうございます。詳しい内容は商品詳細ページをご確認ください。", "unknown", "soft"],
      ["コラボ依頼へ返信", "SNSでのコラボ企画を提案されました。", "内容を確認したいので、条件と希望日を聞きたいです。", "unknown"],
      ["返信を保留する", "すぐに回答が必要な質問を受けました。", "確認が必要なため、明日までお時間をいただきたいです。", "unknown", "soft"],
    ],
  },
  "schedule-adjust": {
    purpose: "request", relationship: "work", subject: "日程調整のお願い",
    incomingLabel: "調整したい予定", detailLabel: "候補日時・所要時間・条件",
    incomingPlaceholder: "例：来週、30分の打ち合わせを設定したい", detailPlaceholder: "例：7月15日10時、16日14時、17日16時",
    templates: [
      ["候補日を出す", "来週、30分ほどお打ち合わせのお時間をいただけますでしょうか。", "候補は7月15日10時、16日14時、17日16時です。ご都合のよい日時をお知らせください。"],
      ["日程変更をお願い", "決まっている打ち合わせの日程変更をお願いできますでしょうか。", "7月15日から、7月17日または18日への変更を希望しています。"],
      ["再調整する", "以前出した候補日では日程が合いませんでした。", "来週後半で、相手の都合のよい時間を2つほど教えてほしいです。", "client", "soft"],
    ],
  },
  "meeting-request": {
    purpose: "request", relationship: "client", subject: "お打ち合わせのお願い",
    incomingLabel: "相談したい内容", detailLabel: "候補日時・所要時間・方法",
    incomingPlaceholder: "例：新しい企画について相談したい", detailPlaceholder: "例：オンラインで30分。候補日は7月15日と16日",
    templates: [
      ["取引先へ依頼", "新しい企画について一度ご相談したいです。", "オンラインで30分を予定しています。候補日は7月15日と16日です。", "client"],
      ["社内で相談", "進行中の案件について相談したいです。", "今週中に30分ほど、空いている時間を教えてほしいです。", "work", "soft"],
      ["初めての相手", "サービスについて説明の機会をいただきたいです。", "オンラインで20分ほどを希望しています。都合のよい日時を伺いたいです。", "unknown", "polite", "long"],
    ],
  },
  "absence-message": {
    purpose: "report", relationship: "boss", subject: "会議欠席のご連絡",
    incomingLabel: "欠席する予定・理由", detailLabel: "代わりの対応・確認事項",
    incomingPlaceholder: "例：本日15時の定例会議を欠席する", detailPlaceholder: "例：別件対応のため。議事録を後で確認する",
    templates: [
      ["会議を欠席", "本日15時の定例会議を欠席します。", "別件対応のためです。終了後に議事録を確認します。", "boss"],
      ["予定を欠席", "明日の社内研修に参加できません。", "体調不良のためです。必要な資料を後日確認します。", "boss"],
      ["直前に連絡", "本日予定していた打ち合わせを欠席します。", "直前のご連絡となり、申し訳ございません。改めて日程調整をお願いできますでしょうか。", "client", "polite"],
    ],
  },
  "feedback-softener": {
    purpose: "rewrite", relationship: "work", includeSubject: false,
    incomingLabel: "やわらかくしたい指摘", detailLabel: "直してほしい点・理由",
    incomingPlaceholder: "例：この資料は分かりにくいので直してください", detailPlaceholder: "例：結論を先にして、数字の根拠を追加してほしい",
    templates: [
      ["資料の修正", "この資料は分かりにくいので直してください。", "結論を先にして、数字の根拠を追加してほしいです。"],
      ["ミスを伝える", "同じ入力ミスが何度もあります。注意してください。", "今後の行き違いを防ぐため、確認手順を一緒に見直したいです。", "work", "soft"],
      ["改善を提案", "このやり方は効率が悪いです。変えてください。", "作業時間を減らすため、別の方法を一緒に検討したいです。", "work", "soft"],
    ],
  },
  "complaint-reply": {
    purpose: "apology", relationship: "customer", subject: "お問い合わせへのお詫びとご案内", useIncoming: false,
    incomingLabel: "届いたクレーム・不満", detailLabel: "確認状況・これからの対応",
    incomingPlaceholder: "例：届いた商品に傷があった", detailPlaceholder: "例：写真を確認後、交換品を手配する",
    templates: [
      ["商品不良", "届いた商品に傷があったと連絡をいただきました。", "ご不快な思いをおかけし、申し訳ございません。写真を確認後、交換品を手配します。", "customer"],
      ["対応の遅れ", "問い合わせへの返信が遅いとご指摘をいただきました。", "返信が遅くなり、申し訳ございません。本日中に担当者からご連絡します。", "customer"],
      ["事実確認中", "サービス内容が説明と違うと連絡がありました。", "ご迷惑をおかけし、申し訳ございません。現在確認中のため、明日までに回答します。", "customer", "polite", "long"],
    ],
  },
  "review-reply": {
    purpose: "reply", relationship: "customer", includeSubject: false, useIncoming: false,
    incomingLabel: "投稿された口コミ", detailLabel: "返信で伝えたいこと",
    incomingPlaceholder: "例：スタッフが親切で、また利用したい", detailPlaceholder: "例：来店へのお礼。次回も待っている",
    templates: [
      ["良い口コミ", "スタッフが親切で、また利用したいと投稿いただきました。", "ご来店と温かい口コミをありがとうございます。次回のご来店もお待ちしております。", "customer", "soft"],
      ["低評価へ返信", "待ち時間が長かったという口コミをいただきました。", "長時間お待たせし、申し訳ございません。案内方法を見直して改善します。", "customer"],
      ["内容を確認する", "説明と実際のサービスが違ったという口コミです。", "ご不快な思いをおかけし、申し訳ございません。詳しい状況を確認させてください。", "customer", "polite"],
    ],
  },
  "customer-support-reply": {
    purpose: "reply", relationship: "customer", subject: "お問い合わせへのご回答", useIncoming: false,
    incomingLabel: "お客様からの問い合わせ", detailLabel: "回答・確認事項・次の対応",
    incomingPlaceholder: "例：注文後に配送先を変更できますか？", detailPlaceholder: "例：発送前なら変更可能。注文番号を確認したい",
    templates: [
      ["質問へ回答", "注文後に配送先を変更できますか？と問い合わせがありました。", "発送前なら変更できます。注文番号を返信してほしいです。", "customer"],
      ["確認に時間が必要", "請求金額について問い合わせがありました。", "現在担当部署で確認中です。明日17時までに回答します。", "customer"],
      ["対応完了を連絡", "ログインできないという問い合わせに対応しました。", "設定を修正したので、再度ログインを試してほしいです。", "customer", "soft"],
    ],
  },
  "deadline-extension-request": {
    purpose: "request", relationship: "client", subject: "提出期限延長のお願い",
    incomingLabel: "延長したい期限・対象", detailLabel: "理由・希望する新期限・対応",
    incomingPlaceholder: "例：7月15日提出予定の資料", detailPlaceholder: "例：確認に時間が必要。7月17日まで延長したい",
    templates: [
      ["提出期限を延長", "7月15日提出予定の資料について相談があります。", "確認に時間が必要なため、7月17日まで延長をお願いしたいです。", "client"],
      ["社内の締切を相談", "本日中の集計作業が完了しない見込みです。", "追加確認が必要なため、明日午前中まで待ってほしいです。", "boss"],
      ["一部を先に提出", "全体の提出が期限に間に合わない見込みです。", "完成部分を本日送り、残りを明日17時までに提出したいです。", "client", "polite", "long"],
    ],
  },
  "payment-reminder": {
    purpose: "remind", relationship: "client", subject: "ご入金状況のご確認",
    incomingLabel: "請求内容・支払期限", detailLabel: "確認したいこと・再案内",
    incomingPlaceholder: "例：6月分請求書、支払期限7月10日", detailPlaceholder: "例：入金が確認できていない。行き違いなら申し訳ない",
    templates: [
      ["入金状況を確認", "6月分請求書のお支払いについて確認したいです。", "支払期限は7月10日で、現在入金を確認できていません。行き違いでしたら申し訳ありません。", "client"],
      ["請求書を再送", "先月お送りした請求書についてご連絡します。", "念のため請求書を再添付し、支払予定日を確認したいです。", "client", "soft"],
      ["社内の精算確認", "立替経費の精算状況を確認したいです。", "申請日は7月1日です。不備があれば教えてほしいです。", "work", "soft"],
    ],
  },
  "task-request": {
    purpose: "request", relationship: "work", subject: "作業のお願い",
    incomingLabel: "お願いしたい作業", detailLabel: "期限・目的・参考情報",
    incomingPlaceholder: "例：資料の数字を確認してほしい", detailPlaceholder: "例：明日12時まで。会議で使うため",
    templates: [
      ["作業をお願い", "資料の数字を確認してほしいです。", "明日12時までを希望します。午後の会議で使用するためです。", "work"],
      ["急ぎでお願い", "本日中に見積書の内容を確認してほしいです。", "急なお願いとなり、申し訳ありません。難しい場合はご相談ください。", "work", "soft"],
      ["取引先へ依頼", "掲載内容の最終確認をお願いしたいです。", "7月15日までに、修正の有無を返信してほしいです。", "client", "polite"],
    ],
  },
  "status-report": {
    purpose: "report", relationship: "boss", subject: "進捗状況のご報告",
    incomingLabel: "現在の進捗・完了したこと", detailLabel: "課題・次の対応・完了予定",
    incomingPlaceholder: "例：資料作成は8割完了", detailPlaceholder: "例：数字の確認待ち。明日15時に完成予定",
    templates: [
      ["順調な進捗", "資料作成は8割まで完了しています。", "残りは数字の確認です。明日15時に完成予定です。", "boss"],
      ["遅れを報告", "予定より作業が半日遅れています。", "追加修正が発生したためです。明日午前中に完了し、11時に再報告します。", "boss"],
      ["判断を依頼", "A案とB案の比較まで完了しました。", "費用を優先するか納期を優先するか、方針を確認したいです。", "boss", "polite"],
    ],
  },
  "health-absence-message": {
    purpose: "report", relationship: "boss", subject: "本日の欠勤について",
    incomingLabel: "体調・勤務の状況", detailLabel: "引き継ぎ・次の連絡予定",
    incomingPlaceholder: "例：発熱のため本日は休みたい", detailPlaceholder: "例：午前の会議は欠席。急ぎの案件は同僚へ共有済み",
    templates: [
      ["当日休む", "発熱があるため、本日は休ませていただきたいです。", "午前の会議は欠席します。急ぎの案件は同僚へ共有済みです。", "boss"],
      ["午前休を相談", "体調がすぐれないため、午前中は休みたいです。", "午後の勤務については11時までに改めて連絡します。", "boss"],
      ["在宅へ変更", "体調不良のため、出社が難しい状況です。", "業務は可能なので、在宅勤務へ変更できるか相談したいです。", "boss", "soft"],
    ],
  },
  "late-arrival-message": {
    purpose: "report", relationship: "boss", subject: "到着遅れのご連絡",
    incomingLabel: "遅れる理由・予定", detailLabel: "到着見込み・必要な対応",
    incomingPlaceholder: "例：電車遅延で出社が遅れる", detailPlaceholder: "例：10時15分到着予定。朝会はオンライン参加",
    templates: [
      ["電車遅延", "電車遅延のため、出社が遅れます。", "10時15分ごろ到着予定です。朝会は移動中のため欠席します。", "boss"],
      ["待ち合わせに遅れる", "前の予定が長引き、到着が遅れます。", "15分ほど遅れる見込みです。先に始めていてほしいです。", "work", "soft"],
      ["取引先へ連絡", "交通事情により、訪問時刻に遅れる可能性があります。", "到着は14時15分ごろです。ご迷惑をおかけすることを謝りたいです。", "client", "polite"],
    ],
  },
  "paid-leave-request": {
    purpose: "request", relationship: "boss", subject: "休暇取得のご相談",
    incomingLabel: "希望する休暇日", detailLabel: "業務調整・引き継ぎ状況",
    incomingPlaceholder: "例：7月22日に有給休暇を取りたい", detailPlaceholder: "例：担当業務は前日までに完了。緊急連絡は確認できる",
    templates: [
      ["有給を申請", "7月22日に有給休暇を取得したいです。", "担当業務は前日までに完了し、必要事項をチームへ共有します。", "boss"],
      ["連休を相談", "8月12日から14日まで休暇を相談したいです。", "進行中の案件は8日までに整理し、同僚へ引き継ぐ予定です。", "boss", "polite"],
      ["急な休み", "家庭の事情により、明日休暇をいただきたいです。", "急なご相談となり、申し訳ございません。今日中に必要な引き継ぎを行います。", "boss", "soft"],
    ],
  },
  "document-send-mail": {
    purpose: "reply", relationship: "client", subject: "資料送付のご連絡",
    incomingLabel: "送る資料・ファイル", detailLabel: "確認事項・期限・補足",
    incomingPlaceholder: "例：打ち合わせで依頼された提案資料", detailPlaceholder: "例：7月15日までに確認してほしい。パスワードは別送",
    templates: [
      ["資料を送付", "先日の打ち合わせで依頼された提案資料を送ります。", "7月15日までに内容を確認してほしいです。", "client"],
      ["修正版を送付", "ご指摘いただいた箇所を修正した資料を送ります。", "2ページ目と5ページ目を更新しました。再度確認をお願いしたいです。", "client"],
      ["ファイルを再送", "先ほど送ったファイルに不備がありました。", "正しいファイルを再送します。先ほどの添付は破棄してほしいです。", "client", "polite"],
    ],
  },
  "confirmation-request": {
    purpose: "request", relationship: "work", subject: "内容確認のお願い",
    incomingLabel: "確認してほしい内容", detailLabel: "確認期限・見るポイント",
    incomingPlaceholder: "例：添付した企画書の内容", detailPlaceholder: "例：金曜までに、金額とスケジュールを確認してほしい",
    templates: [
      ["資料を確認", "添付した企画書の内容を確認してほしいです。", "金曜までに、金額とスケジュールに問題がないか見てほしいです。", "work"],
      ["取引先へ確認", "先日共有した原稿の最終確認をお願いしたいです。", "7月15日までに、修正の有無を返信してほしいです。", "client"],
      ["上司へ判断を依頼", "進行方法についてA案とB案をまとめました。", "明日の会議までに、どちらで進めるか確認したいです。", "boss", "polite"],
    ],
  },
  "estimate-request": {
    purpose: "request", relationship: "client", subject: "お見積もりのお願い",
    incomingLabel: "見積もりを依頼する内容", detailLabel: "数量・希望納期・回答期限",
    incomingPlaceholder: "例：Webサイト改修の費用", detailPlaceholder: "例：5ページ。9月末納品。7月20日までに見積希望",
    templates: [
      ["制作費を確認", "Webサイト5ページの改修費用を確認したいです。", "9月末納品を希望しています。7月20日までに見積もりをいただきたいです。", "client"],
      ["商品をまとめて発注", "商品100個を発注する場合の見積もりをお願いしたいです。", "送料と納期を含めて回答してほしいです。", "client"],
      ["概算を聞く", "新しいシステム導入の概算費用を知りたいです。", "正式な仕様は調整中です。まず費用の目安と期間を伺いたいです。", "unknown", "soft"],
    ],
  },
  "handover-note": {
    purpose: "report", relationship: "work", subject: "引き継ぎ事項",
    incomingLabel: "現在の状況・完了したこと", detailLabel: "次にやること・期限・注意点",
    incomingPlaceholder: "例：顧客Aへの見積書は作成済み", detailPlaceholder: "例：明日午前中に上司確認後、顧客へ送付",
    templates: [
      ["案件を引き継ぐ", "顧客Aへの見積書は作成済みです。", "明日午前中に上司確認後、顧客へ送付してください。金額は最終確認が必要です。", "work"],
      ["休暇前の共有", "進行中の問い合わせ3件の状況を共有します。", "1件は回答待ち、2件は対応済みです。緊急時は担当Bさんへお願いします。", "work"],
      ["退職時の引き継ぎ", "定例作業と担当案件を引き継ぎます。", "手順書は共有フォルダにあります。次回締切は7月31日です。", "work", "polite", "long"],
    ],
  },
  "trouble-report": {
    purpose: "report", relationship: "boss", subject: "問題発生のご報告",
    incomingLabel: "起きた問題・発生時刻", detailLabel: "影響・現在の対応・次の報告",
    incomingPlaceholder: "例：10時ごろ、注文画面でエラーが発生", detailPlaceholder: "例：一部ユーザーが注文不可。担当が調査中。12時に再報告",
    templates: [
      ["システム不具合", "10時ごろ、注文画面でエラーが発生しました。", "一部ユーザーが注文できない状況です。担当が調査中で、12時に再報告します。", "boss"],
      ["作業ミスを報告", "送付した資料に古い数字が含まれていました。", "取引先へ訂正版を送る準備中です。原因を確認し、再発防止も報告します。", "boss"],
      ["納期への影響", "外部サービスの停止により作業が進められません。", "本日の納品が1日遅れる可能性があります。復旧状況を15時に再報告します。", "boss", "polite", "long"],
    ],
  },
};

const profile = toolProfiles[tool.id] || null;

const relationshipLabels = {
  work: "仕事相手",
  boss: "上司",
  client: "取引先",
  customer: "お客様",
  friend: "友達",
  unknown: "まだ関係が浅い相手",
};

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  setTimeout(() => el.toast.classList.remove("show"), 1700);
}

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function defaultSubject() {
  if (profile?.subject) return profile.subject;
  if (tool.id.includes("health")) return "本日の勤務について";
  if (tool.id.includes("late-arrival")) return "到着遅れのご連絡";
  if (tool.id.includes("paid-leave")) return "休暇取得のご相談";
  if (tool.id.includes("document-send")) return "資料送付のご連絡";
  if (tool.id.includes("estimate")) return "お見積もりのお願い";
  if (tool.id.includes("handover")) return "引き継ぎ事項";
  if (tool.id.includes("trouble")) return "状況のご報告";
  if (tool.category === "催促") return "ご確認のお願い";
  if (tool.category === "お礼") return "お礼";
  if (tool.category === "謝罪") return "お詫び";
  if (tool.category === "依頼") return "お願い";
  if (tool.category === "報告") return "進捗のご報告";
  if (tool.category === "日程調整") return "日程調整のお願い";
  return tool.title.replace("メーカー", "").replace("ツール", "");
}

function isChatLike() {
  if (profile?.includeSubject === false) return true;
  return ["チャット", "断り方", "言い換え", "連絡"].includes(tool.category) && el.relationship.value === "friend";
}

function opener(purpose) {
  const friend = el.relationship.value === "friend";
  const casual = state.tone === "casual" || friend;
  if (casual) {
    return {
      reply: "連絡ありがとう。",
      decline: "誘ってくれてありがとう。",
      request: "ちょっとお願いがあります。",
      remind: "念のため確認させてください。",
      thanks: "対応してくれてありがとう。",
      apology: "連絡が遅くなってごめんなさい。",
      report: "今の状況を共有します。",
      rewrite: "",
    }[purpose];
  }
  return {
    reply: "ご連絡いただきありがとうございます。",
    decline: "お声がけいただきありがとうございます。",
    request: "お忙しいところ恐れ入ります。",
    remind: "お忙しいところ恐れ入ります。念のため確認させてください。",
    thanks: "このたびはご対応いただき、ありがとうございます。",
    apology: "このたびはご迷惑をおかけし、申し訳ございません。",
    report: "現在の状況についてご報告いたします。",
    rewrite: "",
  }[purpose];
}

function closing() {
  const friend = el.relationship.value === "friend";
  if (friend || state.tone === "casual") {
    if (state.length === "short") return "";
    return "また確認して連絡します。";
  }
  if (state.length === "short") return "よろしくお願いいたします。";
  if (state.length === "medium") return "お手数をおかけしますが、よろしくお願いいたします。";
  return "お忙しいところ恐れ入りますが、何卒よろしくお願い申し上げます。";
}

function soften(text) {
  let result = text;
  if (state.tone === "soft") {
    result = result
      .replaceAll("対応が難しいです", "対応が少し難しい状況です")
      .replaceAll("確認してください", "ご確認いただけますと幸いです")
      .replaceAll("お願いします", "お願いいたします")
      .replaceAll("できません", "難しい状況です");
  }
  if (state.tone === "casual" || el.relationship.value === "friend") {
    result = result
      .replaceAll("ご連絡いただきありがとうございます。", "連絡ありがとう。")
      .replaceAll("申し訳ございません", "ごめんなさい")
      .replaceAll("恐れ入ります。", "")
      .replaceAll("よろしくお願いいたします。", "よろしくお願いします。");
  }
  return result.replace(/\n{3,}/g, "\n\n").trim();
}

function rewriteOriginal(incoming, detail) {
  const base = incoming || detail || "伝えたい内容を、相手に配慮した表現に整えたいです。";
  if (tool.id === "casual-converter") {
    return cleanText(base)
      .replaceAll("ご都合のよい", "都合のいい")
      .replaceAll("お知らせいただけますでしょうか", "教えてもらえる？")
      .replaceAll("ご確認いただけますと幸いです", "確認してもらえると助かる！")
      .replaceAll("ご対応いただき、誠にありがとうございました", "対応してくれて本当にありがとう")
      .replaceAll("お願いいたします", "お願いします")
      .replaceAll("申し訳ございません", "ごめんなさい")
      .replaceAll("恐れ入りますが、", "")
      .replaceAll("可能でしたら、", "できたら、")
      .replaceAll("？。", "？")
      .replaceAll("！。", "！");
  }
  return cleanText(base)
    .replaceAll("早く", "可能でしたら早めに")
    .replaceAll("してください", "していただけますでしょうか")
    .replaceAll("できません", "対応が難しい状況です")
    .replaceAll("無理です", "今回は難しい状況です")
    .replaceAll("ちゃんと", "念のため")
    .replaceAll("なぜ", "差し支えなければ、理由を");
}

function splitSentences(value) {
  return cleanText(value)
    .split(/[。！？!?]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function politeSentence(sentence) {
  let text = sentence.trim();
  text = text
    .replaceAll("返信してほしいです", "ご返信いただけますでしょうか")
    .replaceAll("確認してほしいです", "ご確認いただけますでしょうか")
    .replaceAll("送ってほしいです", "お送りいただけますでしょうか")
    .replaceAll("教えてほしいです", "教えていただけますでしょうか")
    .replaceAll("お願いしたいです", "お願いできますでしょうか")
    .replaceAll("待ってほしいです", "お待ちいただけますでしょうか")
    .replaceAll("してほしいです", "していただけますでしょうか")
    .replaceAll("してもらいたいです", "していただけますでしょうか")
    .replaceAll("返信してほしい", "ご返信いただけますでしょうか")
    .replaceAll("確認してほしい", "ご確認いただけますでしょうか")
    .replaceAll("送ってほしい", "お送りいただけますでしょうか")
    .replaceAll("してほしい", "していただけますでしょうか")
    .replaceAll("してもらいたい", "していただけますでしょうか")
    .replaceAll("教えてほしい", "教えていただけますでしょうか")
    .replaceAll("お願いしたい", "お願いできますでしょうか")
    .replaceAll("やってほしい", "ご対応いただけますでしょうか")
    .replaceAll("問題があれば", "問題がございましたら")
    .replaceAll("不明点があれば", "不明点がございましたら")
    .replaceAll("急がせすぎず、", "")
    .replaceAll("急がせず、", "");

  if (/(明日中|本日中|今日中|今週中|来週中|午前中|午後中)/.test(text) && !/いただけ|ください|でしょうか|幸いです/.test(text)) {
    text = `${text}ご確認いただけますでしょうか`;
  }

  if (!/[。！？!?]$/.test(text)) text += "。";
  return text;
}

function humanizeCore(source, purpose) {
  const sentences = splitSentences(source);
  if (!sentences.length) return "";

  if (state.tone === "casual" || el.relationship.value === "friend") {
    return sentences.map((sentence) => /[。！？!?]$/.test(sentence) ? sentence : `${sentence}。`);
  }

  if (purpose === "request") {
    const result = sentences.map(politeSentence);
    if (!result.some((line) => /幸いです|お願いいたします|でしょうか|ください/.test(line))) {
      result.push("ご都合のよいタイミングでご対応いただけますと幸いです。");
    }
    return result;
  }

  if (purpose === "remind") {
    return sentences.map((sentence) => {
      const text = politeSentence(sentence);
      return text.includes("確認") ? text : `念のため、${text}`;
    });
  }

  if (purpose === "apology") {
    return sentences.map((sentence) => {
      const text = politeSentence(sentence);
      return text.includes("申し訳") || text.includes("お詫び") ? text : `${text.replace(/。$/, "")}。申し訳ございません。`;
    });
  }

  if (purpose === "report") {
    return sentences.map((sentence) => politeSentence(sentence));
  }

  return sentences.map(politeSentence);
}

function bodyLines(purpose, incoming, detail) {
  const parts = [profile?.useIncoming === false ? "" : incoming, detail].filter(Boolean);
  const core = parts.length ? parts.join("。") : "用件について確認したうえで、あらためてご連絡します。";
  const polishedCore = humanizeCore(core, purpose);
  const conciseCore = polishedCore.length ? polishedCore.join("\n") : cleanText(core);

  if (purpose === "rewrite") {
    return [rewriteOriginal(incoming, detail)];
  }

  if (purpose === "decline") {
    const reason = core || "今回は都合が合わず、対応が難しい状況です。";
    const polishedReason = humanizeCore(reason, "decline").join("\n");
    return state.length === "short"
      ? [polishedReason, "また機会がありましたら、ぜひお願いいたします。"]
      : [
          polishedReason,
          "せっかくお声がけいただいたところ恐縮ですが、今回は見送らせていただけますと幸いです。",
          "また別の機会がありましたら、ぜひお願いいたします。",
        ];
  }

  if (purpose === "remind") {
    return state.length === "short"
      ? [conciseCore, "可能な範囲でご確認いただけますでしょうか。"]
      : [
          conciseCore,
          "行き違いでしたら申し訳ありません。",
          "お手すきの際に、現在の状況だけでもご共有いただけますと助かります。",
        ];
  }

  if (purpose === "apology") {
    return state.length === "short"
      ? [conciseCore, "今後は同じことがないよう注意いたします。"]
      : [conciseCore, "現在、必要な対応を進めております。", "今後は確認を徹底し、再発防止に努めます。"];
  }

  if (purpose === "thanks") {
    return state.length === "short"
      ? [conciseCore || "ご対応いただき、大変助かりました。"]
      : [conciseCore || "ご対応いただき、大変助かりました。", "引き続き、どうぞよろしくお願いいたします。"];
  }

  if (purpose === "request") {
    const follow = /でしょうか|幸いです|お願いいたします/.test(conciseCore)
      ? ""
      : "可能でしたらご対応をお願いいたします。";
    return state.length === "short"
      ? [conciseCore, follow]
      : [
          conciseCore,
          "ご都合のよいタイミングでご確認いただけますと幸いです。",
        ];
  }

  if (purpose === "report") {
    return state.length === "short"
      ? [conciseCore]
      : [conciseCore, "現時点で大きな懸念があれば、あわせて共有いたします。", "次の対応が決まり次第、続けてご報告します。"];
  }

  return state.length === "short"
    ? [conciseCore]
    : [conciseCore, "確認が必要な点があれば、あらためて共有いたします。"];
}

function generate() {
  const purpose = el.purpose.value;
  const incoming = cleanText(el.incoming.value);
  const detail = cleanText(el.detail.value);
  const lines = [];

  if (!isChatLike()) {
    lines.push(`件名：${defaultSubject()}`, "");
  }

  const first = opener(purpose);
  if (first) lines.push(first);

  const bodies = bodyLines(purpose, incoming, detail);
  bodies.forEach((line) => {
    if (!line) return;
    lines.push("", line);
  });

  const end = purpose === "rewrite" ? "" : closing();
  if (end) lines.push("", end);

  el.output.textContent = soften(lines.join("\n"));
}

async function copyOutput() {
  const text = el.output.textContent.trim();
  if (!text) {
    showToast("先に文章を作ってください");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  showToast("コピーしました");
}

document.querySelectorAll(".segmented").forEach((group) => {
  group.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    group.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state[group.dataset.group] = button.dataset.value;
    generate();
  });
});

const templateButtons = Array.from(document.querySelectorAll(".template-button"));

function setSegmentValue(groupName, value) {
  const group = document.querySelector(`.segmented[data-group="${groupName}"]`);
  if (!group) return;
  group.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.value === value);
  });
  state[groupName] = value;
}

function applyTemplate(template) {
  if (!template) return;
  const [, incoming, detail, relationship, tone, length] = template;
  el.incoming.value = incoming;
  el.detail.value = detail;
  el.purpose.value = profile?.purpose || (categoryDefaults[tool.category] || categoryDefaults["チャット"]).purpose;
  el.relationship.value = relationship || profile?.relationship || "work";
  setSegmentValue("tone", tone || "polite");
  setSegmentValue("length", length || "short");
  generate();
}

templateButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.templateIndex);
    applyTemplate(profile?.templates[index]);
  });
});

document.getElementById("generateBtn").addEventListener("click", generate);
document.getElementById("copyBtn").addEventListener("click", copyOutput);
document.getElementById("clearBtn").addEventListener("click", () => {
  el.incoming.value = "";
  el.detail.value = "";
  el.output.textContent = "";
  showToast("クリアしました");
});

[el.incoming, el.purpose, el.relationship, el.detail].forEach((input) => {
  input.addEventListener("input", generate);
  input.addEventListener("change", generate);
});

const defaults = categoryDefaults[tool.category] || categoryDefaults["チャット"];

if (profile) {
  el.incomingLabel.textContent = profile.incomingLabel;
  el.detailLabel.textContent = profile.detailLabel;
  el.incoming.placeholder = profile.incomingPlaceholder;
  el.detail.placeholder = profile.detailPlaceholder;
  templateButtons.forEach((button, index) => {
    const template = profile.templates[index];
    button.hidden = !template;
    if (template) button.textContent = template[0];
  });
  applyTemplate(profile.templates[0]);
} else {
  el.purpose.value = defaults.purpose;
  el.detail.value = defaults.detail;
  generate();
}
