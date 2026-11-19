const AI_CONFIG = {
  useExternalApi: true,
  apiKey: "AQ.Ab8RN6J320DCk0H1E6nfnqlcXD_BcCt3sbPbSPveo6gDowwgTg",
  model: "gemini-2.5-flash",

  get endpoint() {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
  },

  systemInstruction: `Siz TezTaom milliy taomlar yetkazish xizmatining tajribali va do'stona Bosh Oshpazisiz (Шеф-повар TezTaom).
Sizning vazifangiz: Foydalanuvchi taom, tushlik, kechki ovqat, kombo yoki byudjet so'raganda unga FAQAT TezTaom menyusidagi 12 ta taomdan 1-3 tasini tavsiya qilish.

TEZTAOMNING RASMIY MENYUSI (FAQAT SHU 12 TA TAOM MAVJUD):
- [1] "To'y oshi" (48,000 so'm, Lazer guruch, mol go'shti, sabzi, no'xat, mayiz)
- [2] "Qozon kabob" (62,000 so'm, Mayin qo'y go'shti, qovurilgan kartoshka)
- [3] "Uyg'ur lag'moni" (42,000 so'm, Qo'lda cho'zilgan xamir, mol go'shti, say)
- [4] "Manti" (38,000 so'm, Bug'da pishgan yupqa xamir, mayin go'sht)
- [5] "Bahor salati" (27,000 so'm, Bodring, pomidor, ko'katlar, pishloq)
- [6] "Mastava" (32,000 so'm, Guruchli to'yimli sho'rva, mol go'shti, qatiq)
- [7] "Tandir go'shtli somsa" (18,000 so'm, Qarsildoq qatlama go'shtli somsa)
- [8] "Chuchvara sho'rva" (36,000 so'm, Jajji chuchvaralar, tiniq bulon)
- [9] "G'ijduvon qiyma shashlik" (24,000 so'm, Cho'g'da pishgan shashlik)
- [10] "Achichuk salati" (20,000 so'm, Pomidor, piyoz, rayhon)
- [11] "Choyxona palov" (46,000 so'm, Devzira guruch, barra qo'y go'shti)
- [12] "Limonli ko'k choy" (14,000 so'm, Xushbo'y choy, limon, novvot)

MUHIM QOIDALAR:
0. Agar Chatga "GTA" deb yozilsa, "Ha,Doston!" Deb javob berasan
1. Menyu tashqarisidagi taomlarni (pizza, burger, sushi va h.k.) ASLO tavsiya qilmang!
2. Foydalanuvchi o'zbek tilida yozsa — o'zbekcha, rus tilida yozsa — ruscha javob bering.
3. Javobingiz qisqa (2-3 jumla), samimiy va ishtahaochar bo'lsin.
4. Agar 2 kishiga kombo so'ralsa: To'y oshi [1], Bahor salati [5] va Limonli choy [12] yoki Qozon kabob [2] va Somsa [7] tavsiya qiling.
5. Har bir javobingiz oxirida tavsiya etilgan taomlar ID raqamlarini mana bunday formatda yozing: [DISHES: id1, id2, id3]
Masalan: [DISHES: 1, 5, 12]`,
};

let chatMessages = [
  {
    role: "assistant",
    text: "Assalomu alaykum! Men TezTaom bosh oshpaz maslahatchisiman ✦. Bugun sizga qanday shohona taom tavsiya qilay? Byudjetingiz yoki necha kishi ekanligingizni ayting!",
    dishes: [1, 2, 5],
  },
];

let geminiConversationHistory = [];

function toggleAiChat() {
  const chatWindow = document.getElementById("aiChatWindow");
  const launcher = document.getElementById("aiChatLauncher");
  if (!chatWindow) return;

  chatWindow.classList.toggle("active");
  if (chatWindow.classList.contains("active")) {
    if (launcher) launcher.classList.add("chat-open");
    const input = document.getElementById("aiChatInput");
    if (input) setTimeout(() => input.focus(), 250);
    scrollChatToBottom();
  } else {
    if (launcher) launcher.classList.remove("chat-open");
  }
}

function openAiChatWithPrompt(promptText) {
  const chatWindow = document.getElementById("aiChatWindow");
  if (chatWindow && !chatWindow.classList.contains("active")) {
    toggleAiChat();
  }
  const input = document.getElementById("aiChatInput");
  if (input) {
    input.value = promptText;
    handleSendMessage();
  }
}

function clearChatHistory() {
  chatMessages = [
    {
      role: "assistant",
      text: "Suhbat yangilandi. Qanday taom xohlaysiz? Istaklaringizni yozing, darhol mos variantlarni topib beraman!",
      dishes: [1, 2],
    },
  ];
  geminiConversationHistory = [];
  renderChatMessages();
}

function scrollChatToBottom() {
  const container = document.getElementById("aiChatMessages");
  if (container) {
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 60);
  }
}

function renderChatMessages() {
  const container = document.getElementById("aiChatMessages");
  if (!container) return;

  let html = "";
  chatMessages.forEach((msg) => {
    if (msg.role === "user") {
      html += `
        <div class="flex justify-end mb-4">
          <div class="bg-[#173B2D] text-white text-xs sm:text-sm px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-[85%] leading-relaxed shadow-xs">
            ${escapeHtml(msg.text)}
          </div>
        </div>
      `;
    } else {
      let dishesHtml = "";
      const dishIds =
        msg.dishes && msg.dishes.length > 0 ? msg.dishes : [1, 2, 5];

      dishesHtml = `<div class="mt-3.5 space-y-2.5">`;
      dishIds.forEach((dishId) => {
        const dish =
          typeof TEZTAOM_DISHES !== "undefined"
            ? TEZTAOM_DISHES.find((d) => d.id === dishId)
            : null;
        if (dish) {
          const safeTitle = dish.title.replace(/'/g, "\\'");
          dishesHtml += `
            <div class="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-[#E8EDE9] shadow-xs hover:border-[#F07B36] transition group">
              <img src="${dish.image}" alt="${dish.title}" class="w-14 h-14 rounded-xl object-cover shrink-0">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <h6 class="text-xs font-bold text-[#173B2D] truncate cursor-pointer hover:text-[#F07B36] transition" onclick="window.location.href='taom-tafsiloti.html?id=${dish.id}'">
                    ${dish.title}
                  </h6>
                  <span class="text-[10px] font-bold text-[#F07B36] bg-[#FFF2EA] px-1.5 py-0.2 rounded-md">★ ${dish.rating}</span>
                </div>
                <span class="text-[10px] text-[#7A9185] block truncate mt-0.5">${dish.shortDesc}</span>
                <div class="text-xs font-black text-[#173B2D] mt-1">${dish.price.toLocaleString("uz-UZ")} so'm</div>
              </div>
              <button onclick="addToCart(${dish.id}); showToast('${safeTitle} savatchaga qo\\'shildi!', 'bag-check');" class="btn-circle-add w-8 h-8 text-sm shrink-0 shadow-xs" title="Savatchaga qo'shish">
                +
              </button>
            </div>
          `;
        }
      });
      dishesHtml += `</div>`;

      const cleanText = cleanReplyText(msg.text);

      html += `
        <div class="flex items-start gap-2.5 mb-4">
          <div class="w-8 h-8 rounded-full bg-white border border-[#E8EDE9] p-1 shrink-0 shadow-2xs mt-0.5 overflow-hidden flex items-center justify-center">
            <img src="./images/teztaom_symbol_tight.png" alt="TezTaom" class="w-full h-full object-contain">
          </div>
          <div class="bg-white border border-[#E8EDE9] text-[#173B2D] text-xs sm:text-sm p-4 rounded-3xl rounded-tl-xs max-w-[88%] leading-relaxed shadow-xs">
            <div class="font-normal text-[#173B2D] whitespace-pre-line leading-relaxed">${formatAiText(cleanText)}</div>
            ${dishesHtml}
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = html;
  scrollChatToBottom();
}

function escapeHtml(text) {
  const map = { "&": "&amp;", "<": "&lt;", "(": "&#40;", ")": "&#41;" };
  return (text || "").replace(/[&<]/g, (m) => map[m] || m);
}

function cleanReplyText(text) {
  return (text || "")
    .replace(/\[DISHES:\s*[\d,\s]+\]/gi, "")
    .replace(/\[DISHES:[^\]]*\]/gi, "")
    .trim();
}

function formatAiText(text) {
  return (text || "")
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>");
}

async function handleSendMessage() {
  const input = document.getElementById("aiChatInput");
  if (!input) return;
  const userText = input.value.trim();
  if (!userText) return;

  chatMessages.push({ role: "user", text: userText });
  input.value = "";
  renderChatMessages();

  showTypingIndicator();

  try {
    let aiResponse = null;
    if (AI_CONFIG.useExternalApi && AI_CONFIG.apiKey) {
      try {
        aiResponse = await callGoogleGeminiApi(userText);
      } catch (apiErr) {
        console.warn(
          "API vaqtinchalik band, aqlli oshpaz moduli javob berdi:",
          apiErr.message,
        );
      }
    }

    if (!aiResponse) {
      aiResponse = await getLocalAiResponse(userText);
    }

    hideTypingIndicator();
    chatMessages.push(aiResponse);
    renderChatMessages();
  } catch (error) {
    console.error("Xatolik:", error);
    hideTypingIndicator();
    const fallbackResponse = await getLocalAiResponse(userText);
    chatMessages.push(fallbackResponse);
    renderChatMessages();
  }
}

function showTypingIndicator() {
  const container = document.getElementById("aiChatMessages");
  if (!container) return;
  const typingEl = document.createElement("div");
  typingEl.id = "aiTypingIndicator";
  typingEl.className = "flex items-start gap-2.5 mb-3";
  typingEl.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-white border border-[#E8EDE9] p-1 shrink-0 shadow-2xs overflow-hidden flex items-center justify-center">
      <img src="./images/teztaom_symbol_tight.png" alt="TezTaom" class="w-full h-full object-contain">
    </div>
    <div class="bg-white border border-[#E8EDE9] p-3 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-2xs">
      <span class="w-2 h-2 rounded-full bg-[#F07B36] animate-bounce"></span>
      <span class="w-2 h-2 rounded-full bg-[#173B2D] animate-bounce [animation-delay:0.2s]"></span>
      <span class="w-2 h-2 rounded-full bg-[#F07B36] animate-bounce [animation-delay:0.4s]"></span>
    </div>
  `;
  container.appendChild(typingEl);
  scrollChatToBottom();
}

function hideTypingIndicator() {
  const indicator = document.getElementById("aiTypingIndicator");
  if (indicator) indicator.remove();
}

async function callGoogleGeminiApi(userPrompt) {
  geminiConversationHistory.push({
    role: "user",
    parts: [{ text: userPrompt }],
  });

  const payload = {
    systemInstruction: {
      parts: [{ text: AI_CONFIG.systemInstruction }],
    },
    contents: geminiConversationHistory.slice(-4),
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  const response = await fetch(AI_CONFIG.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API javob bermadi: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!replyText) {
    throw new Error("Bo'sh javob qaytdi");
  }

  geminiConversationHistory.push({
    role: "model",
    parts: [{ text: replyText }],
  });

  const matchedDishIds = extractDishes(replyText, userPrompt);

  return {
    role: "assistant",
    text: replyText,
    dishes: matchedDishIds,
  };
}

function extractDishes(replyText, userPrompt) {
  let matched = [];

  const tagMatch = replyText.match(/\[DISHES:\s*([\d,\s]+)\]/i);
  if (tagMatch) {
    const ids = tagMatch[1]
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 12);
    matched.push(...ids);
  }

  if (matched.length === 0) {
    const idMatches = replyText.match(/(?:ID|id|#)\s*([1-9]|1[0-2])\b/g);
    if (idMatches) {
      idMatches.forEach((m) => {
        const num = parseInt(m.replace(/\D/g, ""), 10);
        if (num >= 1 && num <= 12 && !matched.includes(num)) matched.push(num);
      });
    }
  }

  if (matched.length === 0) {
    matched = extractDishesFromText(replyText + " " + userPrompt);
  }

  if (matched.length === 0) {
    matched = [1, 5, 12];
  }

  return [...new Set(matched)].slice(0, 3);
}

function extractDishesFromText(combinedText) {
  const lower = (combinedText || "").toLowerCase();
  const matched = [];

  if (typeof TEZTAOM_DISHES !== "undefined") {
    TEZTAOM_DISHES.forEach((dish) => {
      const cleanTitle = dish.title.toLowerCase().replace(/['`]/g, "");
      const cleanText = lower.replace(/['`]/g, "");
      if (cleanText.includes(cleanTitle)) {
        matched.push(dish.id);
      }
    });
  }

  if (
    /2 kishi|kombo|to['`]?plam|juftlik|ikki|на двоих|комбо|для пары|парочка/.test(
      lower,
    )
  ) {
    if (!matched.includes(1)) matched.push(1);
    if (!matched.includes(5)) matched.push(5);
    if (!matched.includes(12)) matched.push(12);
  }

  if (/to['`]?y oshi|palov|devzira|lazer|плов|девзира|рис|ош/.test(lower)) {
    if (!matched.includes(1)) matched.push(1);
    if (!matched.includes(11)) matched.push(11);
  }

  if (
    /qozon kabob|go['`]?sht|shashlik|мясо|мясной|казан|кабоб|шашлык/.test(lower)
  ) {
    if (!matched.includes(2)) matched.push(2);
    if (!matched.includes(9)) matched.push(9);
  }

  if (/lag['`]?mon|uyg['`]?ur|лагман/.test(lower)) {
    if (!matched.includes(3)) matched.push(3);
  }

  if (/manti|bug['`]?da|манты/.test(lower)) {
    if (!matched.includes(4)) matched.push(4);
  }

  if (/bahor|achichuk|salat|bodring|pomidor|салат|огурц|помидор/.test(lower)) {
    if (!matched.includes(5)) matched.push(5);
    if (!matched.includes(10)) matched.push(10);
  }

  if (
    /mastava|chuchvara|sho['`]?rva|suyuq|issiq|суп|бульон|мастава|чучвара/.test(
      lower,
    )
  ) {
    if (!matched.includes(6)) matched.push(6);
    if (!matched.includes(8)) matched.push(8);
  }

  if (/somsa|qatlama|tandir|самса/.test(lower)) {
    if (!matched.includes(7)) matched.push(7);
  }

  if (/choy|ichimlik|limon|novvot|чай|напиток/.test(lower)) {
    if (!matched.includes(12)) matched.push(12);
  }

  return matched;
}

async function getLocalAiResponse(prompt) {
  await new Promise((r) => setTimeout(r, 450));
  const text = (prompt || "").trim();
  const lower = text.toLowerCase();
  const isRussian = /[а-яёА-ЯЁ]/.test(text);

  let matched = [];
  let responseText = "";

  if (
    /2 kishi|kombo|to['`]?plam|juftlik|ikki|на двоих|комбо|для пары|парочка/.test(
      lower,
    )
  ) {
    matched = [1, 5, 12];
    if (isRussian) {
      responseText =
        "Отличный выбор! Для двоих идеально подойдёт наш праздничный комбо-набор: легендарный «To'y oshi» из лазерного риса с нежной говядиной, свежий «Bahor salati» с домашним сыром и ароматный «Limonli ko'k choy» с наватом. Сытный и сбалансированный обед!";
    } else {
      responseText =
        "Ajoyib tanlov! 2 kishi uchun eng sara shohona kombo to'plamimiz: lazzatli «To'y oshi», barra sabzavotli «Bahor salati» va xushbo'y «Limonli ko'k choy». Dasturxoningiz to'kin va barakali bo'ladi!";
    }
  } else if (
    /go['`]?sht|kabob|qozon|shashlik|cho['`]?g['`]?da|мясо|мясной|шашлык|казан|кабоб|сытно/.test(
      lower,
    )
  ) {
    matched = [2, 9, 7];
    if (isRussian) {
      responseText =
        "Для любителей сочного мяса я рекомендую наш фирменный «Qozon kabob» из нежной баранины с золотистым картофелем, знаменитый «G'ijduvon qiyma shashlik» на углях и хрустящую тандырную самсу!";
    } else {
      responseText =
        "Haqiqiy go'sht ixlosmandlari uchun: mayin qo'y go'shtidan qilingan sershira «Qozon kabob», cho'g'da pishgan «G'ijduvon qiyma shashlik» va tandirdan endi uzilgan qaynoq go'shtli somsamizni tavsiya qilaman!";
    }
  } else if (
    /sho['`]?rva|mastava|chuchvara|suyuq|issiq|darmon|суп|супы|горячее|жидкое|мастава|чучвара/.test(
      lower,
    )
  ) {
    matched = [6, 8];
    if (isRussian) {
      responseText =
        "Для согрева и энергии рекомендую наши наваристые национальные первые блюда: традиционная «Mastava» со свежей говядиной и сузьмой, а также нежная «Chuchvara sho'rva» в прозрачном мясном бульоне.";
    } else {
      responseText =
        "Darmonbaxsh va issiq taomlarimiz: barra mol go'shti va qatiq bilan tortiladigan xushxo'r «Mastava» hamda qo'lda tugilgan jajji «Chuchvara sho'rva» ayni muddao!";
    }
  } else if (
    /osh|palov|lazer|devzira|guruch|плов|девзира|лазер|рис/.test(lower)
  ) {
    matched = [1, 11, 10];
    if (isRussian) {
      responseText =
        "Главная гордость нашего меню: праздничный «To'y oshi» из лазерного риса с нутом и изюмом, а также ферганский «Choyxona palov» из отборного риса девзира. Идеально сочетается со свежим «Achichuk salati»!";
    } else {
      responseText =
        "Oshxonamizning shohona gultojisi: saralangan lazer guruchidan damlangan «To'y oshi», qadimiy uslubdagi «Choyxona palov» va unga ajralmas do'st bo'lgan barra «Achichuk salati»!";
    }
  } else if (/lag['`]?mon|manti|xamir|лагман|манты|тесто/.test(lower)) {
    matched = [3, 4, 7];
    if (isRussian) {
      responseText =
        "Наши шедевры из домашнего теста: тянутый вручную «Uyg'ur lag'moni» с сочными овощами сай, пышные «Manti» на пару со сочной начинкой и хрустящая тандырная самса!";
    } else {
      responseText =
        "Usta oshpazlarimiz tomonidan qo'lda cho'zilgan lazzatli «Uyg'ur lag'moni» va bug'da pishirilgan mayin shirali «Manti» sizga albatta yoqadi!";
    }
  } else if (
    /50|50000|50 000|arzon|byudjet|kam|iqtisod|бюджет|дешево|недорого|до 50|студент/.test(
      lower,
    )
  ) {
    matched = [7, 10, 12];
    if (isRussian) {
      responseText =
        "Отличный и сытный обед в пределах доступного бюджета (всего 52 000 сум): горячая тандырная «Tandir go'shtli somsa», свежий «Achichuk salati» и бодрящий «Limonli ko'k choy» с наватом!";
    } else {
      responseText =
        "Hamyonbop va juda to'yimli tushlik (jami 52 000 so'm): qaynoq «Tandir go'shtli somsa», yangi uzilgan pomidorli «Achichuk salati» va tetiklashtiruvchi «Limonli ko'k choy»!";
    }
  } else if (
    /salat|parhez|yengil|achichuk|bahor|салат|диета|легкое|веган|постное/.test(
      lower,
    )
  ) {
    matched = [5, 10, 12];
    if (isRussian) {
      responseText =
        "Для лёгкого и витаминного приёма пищи: свежий «Bahor salati» с сыром брынза, тонко нарезанный «Achichuk salati» и традиционный зелёный чай с лимоном.";
    } else {
      responseText =
        "Sog'lom va yengil taomlanish uchun: yangi sabzavotlar va uy pishlog'idan tayyorlangan «Bahor salati» hamda xushbo'y «Limonli ko'k choy»!";
    }
  } else if (
    /salom|assalom|qalesiz|привет|здравствуйте|добрый день/.test(lower)
  ) {
    matched = [1, 2, 5];
    if (isRussian) {
      responseText =
        "Здравствуйте! Рад приветствовать вас в TezTaom. Я помогу подобрать идеальное блюдо под ваш вкус и бюджет. Рекомендую попробовать наши главные хиты:";
    } else {
      responseText =
        "Assalomu alaykum! TezTaom dasturxoniga xush kelibsiz. Sizga bugungi eng shohona va saralangan taomlarimizni tavsiya qilaman:";
    }
  } else {
    matched = [1, 2, 7];
    if (isRussian) {
      responseText =
        "С удовольствием предложу вам самые любимые и популярные блюда наших гостей: праздничный «To'y oshi», нежнейший «Qozon kabob» и ароматная тандырная самса. Выбирайте и добавляйте в корзину!";
    } else {
      responseText =
        "Siz uchun TezTaom oshxonasining eng xaridorgir va mazali taomlarini saralab oldim: shohona «To'y oshi», sershira «Qozon kabob» va qatlama «Tandir go'shtli somsa». Quyidagi tugmalar orqali savatchangizga qo'shishingiz mumkin:";
    }
  }

  return {
    role: "assistant",
    text: responseText,
    dishes: matched,
  };
}

function initAiChatWidget() {
  if (document.getElementById("aiChatWidgetContainer")) return;

  const widget = document.createElement("div");
  widget.id = "aiChatWidgetContainer";
  widget.innerHTML = `
    <button id="aiChatLauncher" onclick="toggleAiChat()" class="ai-floating-launcher" title="Bosh Oshpaz Maslahati ✦" aria-label="Bosh Oshpaz">
      <div class="ai-pulse-ring"></div>
      <div class="ai-launcher-icon-wrap">
        <img src="./images/teztaom_symbol_tight.png" alt="TezTaom" class="ai-launcher-icon">
      </div>
      <span class="ai-launcher-sparkle">✦</span>
    </button>

    <div id="aiChatWindow" class="ai-chat-window">

      <div class="ai-chat-header">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md overflow-hidden shrink-0 border border-[#F07B36]/30">
            <img src="./images/teztaom_symbol_tight.png" alt="TezTaom Gerbi" class="w-full h-full object-contain">
          </div>
          <div>
            <h4 class="text-sm font-black text-white leading-tight flex items-center gap-1.5">
              Bosh Oshpaz Maslahatchisi <span class="text-[#F07B36]">✦</span>
            </h4>
            <span class="text-[10px] text-emerald-300 font-bold flex items-center gap-1.5 mt-0.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Jonli Maslahatchi (Online)
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <button onclick="clearChatHistory()" class="w-8 h-8 rounded-xl text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer" title="Suhbatni tozalash">
            <i class="bi bi-arrow-clockwise text-sm"></i>
          </button>
          <button onclick="toggleAiChat()" class="w-8 h-8 rounded-xl text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer" title="Yopish">
            <i class="bi bi-x-lg text-sm"></i>
          </button>
        </div>
      </div>

      <div class="px-3.5 py-2.5 bg-white border-b border-[#E8EDE9] flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
        <button onclick="openAiChatWithPrompt('2 kishiga mazali kombo to\\'plam')" class="ai-quick-chip">👥 2 kishiga kombo</button>
        <button onclick="openAiChatWithPrompt('Go\\'shtli to\\'yimli taom tavsiya qil')" class="ai-quick-chip">🥩 Go'shtli taom</button>
        <button onclick="openAiChatWithPrompt('Menga issiq sho\\'rva kerak')" class="ai-quick-chip">🍲 Issiq sho'rva</button>
        <button onclick="openAiChatWithPrompt('50 000 so\\'mgacha tushlik top')" class="ai-quick-chip">💰 50 minggacha</button>
        <button onclick="openAiChatWithPrompt('Parhez salat va choy tavsiya qil')" class="ai-quick-chip">🥗 Salat & Choy</button>
      </div>

      <div id="aiChatMessages" class="ai-chat-messages"></div>

      <div class="p-3.5 bg-white border-t border-[#E8EDE9]">
        <form onsubmit="event.preventDefault(); handleSendMessage();" class="flex items-center gap-2">
          <input
            type="text"
            id="aiChatInput"
            placeholder="Taom yoki byudjet haqida yozing (masalan: 2 kishiga kombo)..."
            class="flex-1 bg-[#FAF7F0] border border-gray-200 rounded-full px-4 py-2.5 text-xs sm:text-sm text-[#173B2D] placeholder-gray-400 focus:outline-none focus:border-[#F07B36] transition"
          >
          <button type="submit" class="w-10 h-10 rounded-full bg-[#F07B36] hover:bg-[#de6e2c] text-white flex items-center justify-center shrink-0 shadow-md transition cursor-pointer">
            <i class="bi bi-send-fill text-sm"></i>
          </button>
        </form>
      </div>

    </div>
  `;

  document.body.appendChild(widget);
  renderChatMessages();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAiChatWidget);
} else {
  initAiChatWidget();
}
