import React, { useState } from "react";
import { FaPaperPlane, FaLeaf, FaImage } from "react-icons/fa";
import axios from "axios";
import { MdSunny, MdGrass, MdWaterDrop } from "react-icons/md";

const PlantSuggestionCard = ({
  name,
  similarImageUrl,
  description,
  bestLightCondition,
  bestSoilType,
  bestWatering,
}) => {
  const renderInfoRow = (icon, label, content) => (
    <div className="flex items-start mb-2">
      {icon}
      <div className="ml-2">
        <span className="font-bold text-sm text-black">{label}: </span>
        <span className="text-sm text-gray-600">{content}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-4 m-2">
      <h2 className="text-lg font-bold text-gray-800 px-2 py-2">{name}</h2>
      <img
        src={similarImageUrl}
        alt={name}
        className="w-full h-48 object-cover rounded-t-xl"
      />
      <p className="text-sm text-gray-500 px-2 mt-2 line-clamp-3">{description}</p>
      <hr className="my-2" />
      <div className="px-2">
        {renderInfoRow(
          <MdSunny className="text-green-600 text-lg" />,
          "Best Light Condition",
          bestLightCondition
        )}
        {renderInfoRow(
          <MdGrass className="text-green-600 text-lg" />,
          "Best Soil Type",
          bestSoilType
        )}
        {renderInfoRow(
          <MdWaterDrop className="text-green-600 text-lg" />,
          "Best Watering",
          bestWatering
        )}
      </div>
    </div>
  );
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "🌱 Xin chào! Hãy gửi ảnh cây trồng để tôi tư vấn nhé!", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() && !image) return;

    const userMessage = image
      ? { text: "📷 [Hình ảnh]", sender: "user", image }
      : { text: input, sender: "user" };
    setMessages([...messages, userMessage]);
    setInput("");
    setImage(null);

    if (image) {
      await handlePlantIdentification(image);
    } else {
      setTimeout(() => {
        const botReply = {
          text: "🤖 Tôi chỉ có thể nhận diện cây qua ảnh! Vui lòng tải ảnh lên.",
          sender: "bot",
        };
        setMessages((prev) => [...prev, botReply]);
      }, 1000);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      console.log("File info:", file.name, file.size, file.type);
      setImage(file);
    } else {
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Vui lòng chọn file ảnh hợp lệ!", sender: "bot" },
      ]);
    }
  };

  const fetchPlantDetails = async (plantId) => {
    console.log("Fetching details for Plant ID:", plantId);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Api-Key", process.env.REACT_APP_PLANT_ID_API_KEY);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        `https://plant.id/api/v3/kb/plants/${plantId}?details=common_names,url,description,taxonomy,rank,gbif_id,inaturalist_id,image,synonyms,edible_parts,watering,propagation_methods&language=en`,
        requestOptions
      );
      console.log("Fetch Plant Details Status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from /kb/plants:", errorText);
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      console.log("Plant Details Response:", result);
      return result;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin chi tiết cây:", error.message);
      return null;
    }
  };

  const handlePlantIdentification = async (file) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("images", file);
    formData.append("classification_level", "species");

    try {
      const response = await axios.post("https://plant.id/api/v3/identification", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Api-Key": process.env.REACT_APP_PLANT_ID_API_KEY,
        },
      });

      console.log("API Response from /identification:", response.data);

      const suggestions = response.data.result?.classification?.suggestions || response.data.suggestions;
      const plant = suggestions?.[0];

      if (plant) {
        const plantName = plant.name;
        const probability = (plant.probability * 100).toFixed(2);
        const imageUrlFromIdentification = response.data.input.images[0]; // Lấy URL ảnh từ /identification

        setMessages((prev) => [
          ...prev,
          { text: `🌿 Cây nhận diện: ${plantName} (Độ chính xác: ${probability}%)`, sender: "bot" },
        ]);

        const plantDetails = await fetchPlantDetails(plant.id);
        const suggestion = {
          name: plantName,
          similarImageUrl: plantDetails?.image?.value || imageUrlFromIdentification || "https://via.placeholder.com/300x200",
          description: plantDetails?.description?.value || "Không có thông tin mô tả từ API chi tiết.",
          bestLightCondition: plantDetails?.light?.value || "Không có thông tin ánh sáng.",
          bestSoilType: plantDetails?.soil?.value || "Không có thông tin đất.",
          bestWatering: plantDetails?.watering?.value || "Không có thông tin tưới nước.",
        };

        setMessages((prev) => [
          ...prev,
          {
            text: <PlantSuggestionCard {...suggestion} />,
            sender: "bot",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { text: "🤖 Không nhận diện được cây này. Hãy thử lại!", sender: "bot" },
        ]);
      }
    } catch (error) {
      let errorMessage = "Lỗi không xác định";
      if (error.response) {
        errorMessage = `Lỗi từ server: ${error.response.status} - ${error.response.data.message || JSON.stringify(error.response.data)
          }`;
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra mạng!";
      } else {
        errorMessage = error.message;
      }

      console.error("Lỗi nhận diện cây:", error.response?.data || error);
      setMessages((prev) => [
        ...prev,
        { text: `⚠️ Lỗi khi nhận diện: ${errorMessage}. Vui lòng thử lại!`, sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-green-100">
      <div className="bg-green-600 text-white py-4 px-5 text-2xl font-bold flex items-center gap-3 shadow-md">
        <FaLeaf className="text-3xl" />
        Chatbot Healthcare Cây Trồng
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-5 py-3 rounded-2xl max-w-xs shadow-md ${msg.sender === "user" ? "bg-green-600 text-white" : "bg-white text-gray-800"
                }`}
            >
              {msg.image ? (
                <img src={URL.createObjectURL(msg.image)} alt="Uploaded" className="w-40 h-40 rounded-lg" />
              ) : typeof msg.text === "string" ? (
                <pre>{msg.text}</pre>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-center">
            <span className="text-gray-500">⏳ Đang nhận diện...</span>
          </div>
        )}
      </div>
      <div className="flex p-5 bg-white border-t">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="upload"
        />
        <label
          htmlFor="upload"
          className="cursor-pointer bg-gray-200 p-3 rounded-xl shadow-md hover:bg-gray-300 transition"
        >
          <FaImage className="text-xl text-gray-700" />
        </label>
        <input
          type="text"
          className="flex-1 border rounded-xl px-4 py-3 text-lg outline-none shadow-sm mx-3"
          placeholder="Nhập tin nhắn hoặc gửi ảnh..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button
          className="bg-green-600 text-white px-5 py-3 rounded-xl flex items-center shadow-md hover:bg-green-700 transition"
          onClick={handleSendMessage}
          disabled={loading}
        >
          {loading ? "⏳" : <FaPaperPlane className="text-xl" />}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;