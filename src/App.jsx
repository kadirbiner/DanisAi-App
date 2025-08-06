import { useState } from "react";
import {
  Box,
  MessageSquare,
  Loader,
  Sparkles,
  AlertCircle,
  Search,
} from "lucide-react";
import SearchModal from "./components/SearchModal";

const App = () => {
  const [mesaj, setMesaj] = useState("");
  const [chat, setChat] = useState([]);
  const [oneriler, setOneriler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analizler, setAnalizler] = useState({});
  const [modalData, setModalData] = useState(null);

  const generateSearchLinks = (urunIsmi) => {
    const encodedQuery = encodeURIComponent(urunIsmi);
    return {
      google: `https://www.google.com/search?q=${encodedQuery}`,
      amazon: `https://www.amazon.com.tr/s?k=${encodedQuery}`,
      trendyol: `https://www.trendyol.com/sr?q=${encodedQuery}`,
      hepsiburada: `https://www.hepsiburada.com/ara?q=${encodedQuery}`,
    };
  };

  const hediyeAra = async () => {
    if (!mesaj.trim()) return;

    const yeniChat = [...chat, { rol: "kullanici", yazi: mesaj }];
    setChat(yeniChat);
    setLoading(true);
    setOneriler([]);
    setAnalizler({});

    try {
      const chatHistory = yeniChat.map((m) => ({
        role: m.rol === "kullanici" ? "user" : "model",
        parts: [{ text: m.yazi }],
      }));

      const prompt = `Kullanıcının aşağıdaki açıklamasına göre, onun ihtiyacını doğrudan karşılayacak 3 farklı ürün önerisi yap. 
Her bir ürün için şu bilgileri JSON dizisi olarak ver. Yanıtında JSON dizisi dışında hiçbir metin, açıklama veya markdown biçimi (örneğin: \`\`\`json) KULLANMA. Sadece JSON dizisini doğrudan döndür.

- "isim" (ürün ismi, marka ve model içermeli)
- "açıklama" (bu ürünün neden uygun olduğunu açıkla)
- "kategori" (örn: Teknoloji, Sağlık, Moda, Seyahat, Ev Eşyası, Evcil Hayvan, Eğitim, vs.)

Kullanıcı açıklaması: "${mesaj}". Yanıtı bir JSON dizisi olarak formatla. Her bir nesne şu özellikleri içersin: "isim", "açıklama", "kategori" (Örn: Teknoloji, Evcil Hayvan, Eğitim, Moda, Yaşam, Sağlık, Seyahat gibi).`;

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                isim: { type: "STRING" },
                açıklama: { type: "STRING" },
                kategori: { type: "STRING" },
              },
            },
          },
        },
      };

      const GEMINI_KEY_ONERI = import.meta.env.VITE_GEMINI_KEY_ONERI;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_KEY_ONERI}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `API çağrısı başarısız oldu: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const cleanedText = jsonMatch[0];
          const parsedOneriler = JSON.parse(cleanedText);
          const onerilerWithLinks = parsedOneriler.map((oneriyi) => ({
            ...oneriyi,
            links: generateSearchLinks(oneriyi.isim),
          }));
          setOneriler(onerilerWithLinks);
          setChat([
            ...yeniChat,
            { rol: "bot", yazi: "Sana özel önerilerim hazır!" },
          ]);
        } else {
          throw new Error("API'den geçerli bir JSON DİZİSİ yanıtı alınamadı.");
        }
      } else {
        throw new Error("API'den geçerli bir yanıt alınamadı.");
      }
    } catch (err) {
      console.error(err);
      setChat([
        ...yeniChat,
        {
          rol: "bot",
          yazi: `API çağrısı sırasında bir sorun oluştu: ${err.message}. Lütfen API anahtarınızı kontrol edin veya tekrar deneyin.`,
        },
      ]);
    }

    setMesaj("");
    setLoading(false);
  };

  const kategoriRengi = (kategori) => {
    switch ((kategori || "").toLowerCase()) {
      case "teknoloji":
        return "bg-sky-500";
      case "evcil hayvan":
        return "bg-emerald-500";
      case "eğitim":
        return "bg-indigo-500";
      case "moda":
        return "bg-purple-500";
      case "yaşam":
        return "bg-amber-500";
      case "sağlık":
        return "bg-red-500";
      case "seyahat":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const pismanlikAnaliziYap = async (urunIsmi, urunAciklama, index) => {
    setAnalizler((prev) => ({
      ...prev,
      [index]: "Yükleniyor...",
    }));

    try {
      const prompt = `Ürünün adı: ${urunIsmi}
Ürünün açıklaması: ${urunAciklama}

Aşağıdaki başlıklar altında bir pişmanlık analizi yap ve yanıtını sadece JSON formatında ver. 
Lütfen hiçbir markdown, açıklama ya da ekstra metin ekleme, sadece geçerli JSON döndür.

- "pismanlikYuzdesi": 1-100 arası sayı,
- "ihtiyacAnalizi": { "puan": 1-100 arası sayı, "aciklama": "kısa açıklama" },
- "surdurulebilirlikPuani": { "puan": 1-100 arası sayı, "aciklama": "kısa açıklama" },
- "kullanimOmru": { "puan": 1-100 arası sayı, "aciklama": "kısa açıklama" },
- "fiyatPerformansYorumu": { "puan": 1-100 arası sayı, "aciklama": "kısa açıklama" }

JSON yapısı şu şekilde olmalı:
{
  "pismanlikYuzdesi": 0,
  "ihtiyacAnalizi": { "puan": 0, "aciklama": "" },
  "surdurulebilirlikPuani": { "puan": 0, "aciklama": "" },
  "kullanimOmru": { "puan": 0, "aciklama": "" },
  "fiyatPerformansYorumu": { "puan": 0, "aciklama": "" }
}`;

      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
        },
      };

      const GEMINI_KEY_ANALIZ = import.meta.env.VITE_GEMINI_KEY_ANALIZ;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY_ANALIZ}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API çağrısı başarısız oldu: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      console.log("API Yanıtı:", text);

      if (text && text.includes("{") && text.includes("}")) {
        try {
          const firstBrace = text.indexOf("{");
          const lastBrace = text.lastIndexOf("}");
          const cleanedText = text.substring(firstBrace, lastBrace + 1);
          const parsedAnaliz = JSON.parse(cleanedText);

          localStorage.setItem("analysisReport", JSON.stringify(parsedAnaliz));
          localStorage.setItem("analysisItem", urunIsmi);
          window.open("/analysis", "_blank");

          setAnalizler((prev) => ({
            ...prev,
            [index]: `✅ Analiz tamamlandı. Detayları yeni sekmede açılıyor...`,
          }));
        } catch (parseError) {
          throw new Error(
            "Yanıt JSON parse edilirken hata oluştu: " + parseError.message
          );
        }
      } else {
        throw new Error(
          "API'den geçerli bir JSON yanıtı alınamadı veya yanıt bozuk:\n" + text
        );
      }
    } catch (err) {
      console.error(err);
      setAnalizler((prev) => ({
        ...prev,
        [index]: `❌ Analiz sırasında bir sorun oluştu: ${err.message}. Lütfen API anahtarınızı kontrol edin veya tekrar deneyin.`,
      }));
    }
  };

  const openModal = (urunIsmi, links) => {
    setModalData({ urunIsmi, links });
  };

  const closeModal = () => {
    setModalData(null);
  };

  return (
    <div className="w-screen min-h-screen bg-zinc-900 text-white p-4 md:p-8 flex flex-col items-center font-sans">
      <div className="text-center mt-6 mb-10">
        <h1 className="text-6xl md:text-5xl font-extrabold text-sky-400 font-sans tracking-tight">
          DanışAI
        </h1>
        <p className="mt-2 text-sm md:text-base text-zinc-300 font-mono">
          'Alışveriş danışmanı'
        </p>
      </div>

      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
          <div className="flex-1 bg-zinc-800 rounded-2xl shadow-xl p-6 flex flex-col max-h-[700px]">
            <div className="flex items-center gap-4 mb-6">
              <MessageSquare className="text-sky-400" size={32} />
              <h2 className="text-2xl font-semibold">Sohbet</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 mb-4 space-y-4">
              {chat.map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl shadow-md ${
                    m.rol === "kullanici"
                      ? "bg-sky-600 text-white text-right ml-auto max-w-[80%]"
                      : "bg-zinc-700 text-left max-w-[80%]"
                  }`}
                >
                  {m.yazi}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 p-3 rounded-xl shadow-md bg-zinc-700 max-w-[80%]">
                  <Loader className="animate-spin text-sky-400" size={20} />
                  <span>Düşünüyor...</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <textarea
                value={mesaj}
                onChange={(e) => setMesaj(e.target.value)}
                placeholder="Kişiyi tanımlayan kısa bir açıklama yazın..."
                rows={3}
                className="w-full p-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
              />
              <button
                onClick={hediyeAra}
                disabled={loading}
                className="w-full bg-sky-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-sky-700 transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={20} />
                  <span>Gönder</span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex-1 bg-zinc-800 rounded-2xl shadow-xl p-6 flex flex-col max-h-[700px]">
            <div className="flex items-center gap-4 mb-6">
              <Box className="text-sky-400" size={32} />

              <h2 className="text-2xl font-semibold">Önerilen ürünler</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {oneriler.length > 0 ? (
                oneriler.map((o, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="bg-zinc-700 rounded-xl p-5 shadow-md border-t-4 border-sky-500 transition-transform hover:scale-[1.01]">
                      <div
                        className={`inline-block px-3 py-1 text-sm font-semibold text-white rounded-full mb-3 ${kategoriRengi(
                          o.kategori
                        )}`}
                      >
                        {o.kategori || "Diğer"}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {o.isim}
                      </h3>
                      <p className="text-zinc-300 text-sm">{o.açıklama}</p>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => openModal(o.isim, o.links)}
                          className="flex-1 bg-sky-500 text-white font-semibold py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Search size={16} />
                          <span>Ürünü Ara</span>
                        </button>
                        <button
                          onClick={() =>
                            pismanlikAnaliziYap(o.isim, o.açıklama, i)
                          }
                          className="flex-1 bg-orange-500 text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <AlertCircle size={16} />
                          <span>Ürün Analizi Yap</span>
                        </button>
                      </div>
                    </div>
                    {analizler[i] && (
                      <div
                        className={`bg-zinc-700 p-4 rounded-xl shadow-md ${
                          analizler[i].includes("❌")
                            ? "text-red-400"
                            : "text-emerald-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles size={20} />
                          <p className="text-sm">{analizler[i]}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-zinc-400 text-center">
                  Henüz bir ürün önerisi bulunamadı.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {modalData && (
        <SearchModal
          urunIsmi={modalData.urunIsmi}
          links={modalData.links}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default App;
