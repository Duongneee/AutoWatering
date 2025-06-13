import React, { useState } from "react";
import { FaLeaf, FaImage } from "react-icons/fa";
import axios from "axios";
import { MdSunny, MdGrass, MdWaterDrop } from "react-icons/md";

const PlantSuggestionCard = ({
  name,
  similarImageUrl,
  description,
  bestLightCondition,
  bestSoilType,
  bestWatering,
  isHealthy,
  diseaseSuggestions,
  isDiagnosis = false,
}) => {
  const renderInfoRow = (icon, label, content) => (
    <div className="flex items-start mb-4">
      {icon}
      <div className="ml-3">
        <span className="font-semibold text-sm text-gray-800">{label}: </span>
        <span className="text-sm text-gray-600">{content}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 m-4 max-w-md transform hover:scale-105 transition-all duration-300 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">{name}</h2>
      <img
        src={similarImageUrl}
        alt={name}
        className="w-full h-64 object-cover rounded-xl shadow-md"
      />
      {!isDiagnosis ? (
        <>
          <p className="text-sm text-gray-600 mt-4 line-clamp-3">{description}</p>
          <hr className="my-5 border-gray-200" />
          <div>
            {renderInfoRow(
              <MdSunny className="text-yellow-500 text-xl" />,
              "Ánh sáng tốt nhất",
              bestLightCondition || "Không có thông tin."
            )}
            {renderInfoRow(
              <MdGrass className="text-green-500 text-xl" />,
              "Loại đất tốt nhất",
              bestSoilType || "Không có thông tin."
            )}
            {renderInfoRow(
              <MdWaterDrop className="text-blue-500 text-xl" />,
              "Tưới nước tốt nhất",
              bestWatering || "Không có thông tin."
            )}
          </div>
        </>
      ) : (
        <div className="mt-4">
          {isHealthy !== undefined && (
            <div>
              <span className="font-semibold text-sm text-gray-800">Sức khỏe: </span>
              <span className={`text-sm ${isHealthy ? "text-green-600" : "text-red-600"}`}>
                {isHealthy ? "Khỏe mạnh" : "Không khỏe"}
              </span>
              {!isHealthy && diseaseSuggestions?.length > 0 ? (
                <div className="mt-3">
                  <span className="font-semibold text-sm text-gray-800">Thông tin bệnh:</span>
                  <ul className="mt-2 text-sm text-gray-600 space-y-4">
                    {diseaseSuggestions.map((disease, idx) => (
                      <li key={idx}>
                        <strong>{disease.name}</strong> ({(disease.probability * 100).toFixed(2)}%)
                        {disease.description && <p className="mt-1">Mô tả: {disease.description}</p>}
                        {disease.treatment?.chemical?.length > 0 && (
                          <p className="mt-1">Điều trị hóa học: {disease.treatment.chemical.join(", ")}</p>
                        )}
                        {disease.treatment?.biological?.length > 0 && (
                          <p className="mt-1">Điều trị sinh học: {disease.treatment.biological.join(", ")}</p>
                        )}
                        {disease.treatment?.prevention?.length > 0 && (
                          <p className="mt-1">Phòng ngừa: {disease.treatment.prevention.join(", ")}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : !isHealthy && (
                <p className="mt-2 text-sm text-gray-600">Không tìm thấy thông tin bệnh cụ thể.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Xin chào! Tải ảnh cây để nhận diện hoặc chẩn đoán nhé!", sender: "bot" },
  ]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setMessages((prev) => [
        ...prev,
        { text: "[Hình ảnh]", sender: "user", image: file },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Vui lòng chọn file ảnh hợp lệ!", sender: "bot" },
      ]);
    }
  };

  const handlePlantIdentification = async (file, isDiagnosis) => {
    if (!file) {
      setMessages((prev) => [
        ...prev,
        { text: "Vui lòng tải ảnh trước khi thực hiện!", sender: "bot" },
      ]);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("images", file);
    formData.append("similar_images", "true");

    try {
      const endpoint = isDiagnosis
        ? "https://plant.id/api/v3/health_assessment?language=vi&details=local_name,description,url,treatment,classification,common_names,cause"
        : "https://plant.id/api/v3/identification?classification_level=species&language=vi&details=common_names,description,best_light_condition,best_soil_type,best_watering";

      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Api-Key": process.env.REACT_APP_PLANT_ID_API_KEY,
        },
      });

      console.log("API Response:", response.data);

      const { result } = response.data;
      const isPlant = result.is_plant?.binary ?? true;

      if (!isPlant) {
        setMessages((prev) => [
          ...prev,
          { text: "Hình ảnh không chứa cây trồng. Hãy thử lại!", sender: "bot" },
        ]);
        setLoading(false);
        return;
      }

      let suggestion = {};
      if (!isDiagnosis) {
        const plant = result.classification.suggestions[0];
        const details = plant.details;
        const plantName = plant.name;
        const probability = (plant.probability * 100).toFixed(2);

        suggestion = {
          name: details?.common_names?.[0] || plantName,
          similarImageUrl: plant.similar_images?.[0]?.url || "https://via.placeholder.com/300x200",
          description: details?.description?.value || "Không có mô tả.",
          bestLightCondition: details?.best_light_condition || "Không có thông tin.",
          bestSoilType: details?.best_soil_type || "Không có thông tin.",
          bestWatering: details?.best_watering || "Không có thông tin.",
          isDiagnosis: false,
        };

        setMessages((prev) => [
          ...prev,
          {
            text: `Nhận diện: ${plantName} (Độ chính xác: ${probability}%)`,
            sender: "bot",
          },
          { text: <PlantSuggestionCard {...suggestion} />, sender: "bot" },
        ]);
      } else {
        const isHealthy = result.is_healthy.binary;
        const diseaseSuggestions = result.disease?.suggestions || [];
        const plantName = diseaseSuggestions[0]?.details?.common_names?.[0] || "Cây không xác định";

        suggestion = {
          name: plantName,
          similarImageUrl:
            diseaseSuggestions[0]?.similar_images?.[0]?.url || "https://via.placeholder.com/300x200",
          isHealthy: isHealthy,
          diseaseSuggestions: diseaseSuggestions.map((disease) => ({
            name: disease.details?.local_name || disease.name || "Không xác định",
            probability: disease.probability || 0,
            description: disease.details?.description?.value || "Không có mô tả chi tiết.",
            treatment: {
              chemical: disease.details?.treatment?.chemical || [],
              biological: disease.details?.treatment?.biological || [],
              prevention: disease.details?.treatment?.prevention || [],
            },
          })),
          isDiagnosis: true,
        };

        setMessages((prev) => [
          ...prev,
          {
            text: `Chẩn đoán: ${plantName} (${isHealthy ? "Khỏe mạnh" : "Có dấu hiệu bệnh"})`,
            sender: "bot",
          },
          { text: <PlantSuggestionCard {...suggestion} />, sender: "bot" },
        ]);
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Lỗi từ server: ${error.response.status} - ${error.response.data.message || "Lỗi không xác định"}`
        : "Không thể kết nối đến server. Vui lòng kiểm tra mạng!";
      setMessages((prev) => [
        ...prev,
        { text: `⚠️ Lỗi: ${errorMessage}. Vui lòng thử lại!`, sender: "bot" },
      ]);
      console.error("Identification error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-green-100 ">
      <div className="bg-green-500 text-white py-6 px-6 text-2xl font-bold flex items-center justify-center gap-3 shadow-lg">
        <FaLeaf className="text-3xl" />
        Plant ChatBot
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-5 py-3 rounded-2xl max-w-md shadow-md ${msg.sender === "user" ? "bg-green-500 text-white" : "bg-white text-gray-800"
                }`}
            >
              {msg.image ? (
                <img
                  src={URL.createObjectURL(msg.image)}
                  alt="Uploaded"
                  className="w-48 h-48 rounded-lg shadow-md"
                />
              ) : typeof msg.text === "string" ? (
                <pre className="whitespace-pre-wrap text-sm">{msg.text}</pre>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-center">
            <span className="text-gray-600 text-base animate-pulse">⏳ Đang xử lý...</span>
          </div>
        )}
      </div>
      <div className="flex justify-center gap-6 p-6 bg-green-100 shadow-inner border-t border-gray-100">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="upload"
        />
        <label
          htmlFor="upload"
          className="cursor-pointer bg-gray-100 p-4 rounded-full shadow-md hover:bg-gray-200 transition flex items-center justify-center"
        >
          <FaImage className="text-2xl text-gray-600" />
        </label>
        <button
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-md hover:from-green-600 hover:to-green-700  transition disabled:bg-gray-400 text-sm font-semibold"
          onClick={() => handlePlantIdentification(image, false)}
          disabled={loading}
        >
          Nhận diện cây
        </button>
        <button
          className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-gradient-to-r from-teal-600 hover:to-teal-700 transition disabled:bg-gray-400 text-sm font-semibold"
          onClick={() => handlePlantIdentification(image, true)}
          disabled={loading}
        >
          Chẩn đoán bệnh cây
        </button>
      </div>
    </div>
  );
};

export default Chatbot;