#include <Wire.h>
#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include "time.h" // Thêm thư viện time.h

// WiFi và Firebase thông tin
#define WIFI_SSID "Sayuu"
#define WIFI_PASSWORD "11111111"
#define API_KEY "AIzaSyALwBsc9XNs9O4JG1QIG494XUPXhCF1CnM"
#define USER_EMAIL "iot@gmail.com"
#define USER_PASSWORD "Duongquachiot"
#define DATABASE_URL "https://auto-watering-7c50f-default-rtdb.europe-west1.firebasedatabase.app/"

// Firebase đối tượng
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Database Paths
const String moisturePath = "gardens/gardenId1/doAmDat/current";
const String pumpStatusPath = "gardens/gardenId1/mayBom/trangThai";
const String historyPath = "gardens/gardenId1/doAmDat/history";
const String maxPath = "gardens/gardenId1/doAmDat/max";
const String minPath = "gardens/gardenId1/doAmDat/min";

// Pin định nghĩa
const int pumpPin = 14;
const int moistureSensorPin = 33;

bool signUp = false;
bool autoControl = false;

// Hàm lấy thời gian định dạng ISO 8601
String getFormattedTime()
{
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo))
  {
    Serial.println("Failed to obtain time");
    return "";
  }
  char timeString[20];
  strftime(timeString, sizeof(timeString), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(timeString);
}

// Khởi tạo WiFi và Firebase
void connectToWifi();
void connectToFirebase();
void configListener();
void autoControlling();
void sendingData();
int readSoilMoisture();

void setup()
{
  Serial.begin(115200);
  pinMode(pumpPin, OUTPUT);
  pinMode(moistureSensorPin, INPUT);

  connectToWifi();
  connectToFirebase();

  // Khởi tạo NTP
  configTime(7 * 3600, 0, "pool.ntp.org"); // GMT+7
}

void loop()
{
  configListener();
  autoControlling();
  sendingData();
}

// Hàm kết nối WiFi
void connectToWifi()
{
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("\nConnecting to WiFi");
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".,.");
    delay(300);
  }
  Serial.print("\nWiFi connected with IP: ");
  Serial.println(WiFi.localIP());
}

// Hàm kết nối Firebase
void connectToFirebase()
{
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  Firebase.reconnectWiFi(true);
  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);

  if (Firebase.ready() && Firebase.RTDB.setInt(&fbdo, moisturePath.c_str(), readSoilMoisture()))
  {
    Serial.println("Firebase connected and initial data set.");
    signUp = true;
  }
  else
  {
    Serial.printf("Firebase connect error: %s\n", fbdo.errorReason().c_str());
  }
}

// Đọc độ ẩm đất
int readSoilMoisture()
{
  int sensorValue = analogRead(moistureSensorPin);
  return map(sensorValue, 2000, 4095, 100, 0); // Điều chỉnh theo giá trị cảm biến
}

// Cấu hình listener để kiểm tra trạng thái máy bơm và điều khiển máy bơm
void configListener()
{
  if (Firebase.ready() && signUp)
  {
    if (Firebase.RTDB.getInt(&fbdo, pumpStatusPath.c_str()))
    {
      int pumpState = fbdo.intData();
      Serial.print("Pump State from Firebase: ");
      Serial.println(pumpState);

      if (pumpState == 1)
      {
        digitalWrite(pumpPin, HIGH);
        Serial.println("Pump ON");
        autoControl = false;
      }
      else if (pumpState == 0)
      {
        digitalWrite(pumpPin, LOW);
        Serial.println("Pump OFF");
        autoControl = false;
      }
      else if (pumpState / 10 == 2)
      {
        autoControl = true;
        Serial.println("Pump in AUTO mode");
      }
    }
  }
  else
  {
    Serial.println("Firebase disconnected");
  }
}

// Điều khiển tự động máy bơm dựa trên độ ẩm đất
void autoControlling()
{
  if (autoControl)
  {
    int soilMoisture = readSoilMoisture();
    int maxMoisture, minMoisture;
    int newPumpStatus;

    // Lấy giá trị max và min từ Firebase
    if (Firebase.RTDB.getInt(&fbdo, "gardens/gardenId1/doAmDat/max") && fbdo.dataType() == "int")
    {
      maxMoisture = fbdo.intData();
    }
    else
    {
      Serial.println("Failed to get max moisture level from Firebase.");
      maxMoisture = 90;
    }

    if (Firebase.RTDB.getInt(&fbdo, "gardens/gardenId1/doAmDat/min") && fbdo.dataType() == "int")
    {
      minMoisture = fbdo.intData();
    }
    else
    {
      Serial.println("Failed to get min moisture level from Firebase.");
      minMoisture = 30;
    }

    // Điều khiển máy bơm dựa trên độ ẩm đất và giá trị max/min
    if (soilMoisture > maxMoisture)
    {
      digitalWrite(pumpPin, LOW);
      Serial.println("Pump OFF (Auto Mode)");
      newPumpStatus = 20; // Tự động, máy bơm Tắt
    }
    else if (soilMoisture < minMoisture)
    {
      digitalWrite(pumpPin, HIGH);
      Serial.println("Pump ON (Auto Mode)");
      newPumpStatus = 21; // Tự động, máy bơm Bật
    }
    else
    {
      Serial.println("Soil moisture within desired range. No action taken.");
      return; // Không gửi trạng thái mới nếu không có thay đổi
    }

    // Gửi trạng thái mới lên Firebase
    if (Firebase.ready() && signUp)
    {
      if (!Firebase.RTDB.setInt(&fbdo, pumpStatusPath.c_str(), newPumpStatus))
      {
        Serial.print("Failed to update pump status: ");
        Serial.println(fbdo.errorReason());
      }
    }
  }
}

// Gửi dữ liệu độ ẩm đất lên Firebase và lưu lịch sử
void sendingData()
{
  static unsigned long lastSendTime = 0;
  static unsigned long lastHistoryUpdateTime = 0;
  unsigned long sendInterval = autoControl ? 3000 : 15000; // 3s cho auto, 15s cho bình thường
  unsigned long historyInterval = 1800000;                 // 30 phút mặc định

  if (Firebase.ready() && signUp)
  {
    int soilMoisture = readSoilMoisture();
    String formattedTime = getFormattedTime();

    // Lấy giá trị time từ Firebase
    if (Firebase.RTDB.getInt(&fbdo, "gardens/gardenId1/time") && fbdo.dataType() == "int")
    {
      historyInterval = fbdo.intData() * 1000; 
      Serial.print("History interval set to: ");
      Serial.println(historyInterval);
    }
    else
    {
      Serial.print("Failed to get history interval, using default: ");
      Serial.println(historyInterval);
    }

    // Gửi dữ liệu độ ẩm đất thường xuyên (3s hoặc 15s)
    if (millis() - lastSendTime > sendInterval)
    {
      if (Firebase.RTDB.setInt(&fbdo, moisturePath.c_str(), soilMoisture))
      {
        Serial.print("Sent soil moisture: ");
        Serial.println(soilMoisture);
      }
      else
      {
        Serial.print("Failed to send soil moisture: ");
        Serial.println(fbdo.errorReason());
      }
      lastSendTime = millis();
    }

    // Cập nhật lịch sử độ ẩm đất theo lịch
    if (formattedTime != "" && (millis() - lastHistoryUpdateTime > historyInterval))
    {
      static int timestampCounter = 10;
      String timestampPath = historyPath + "/timestamp" + String(timestampCounter);
      FirebaseJson historyData;
      historyData.set("time", formattedTime);
      historyData.set("value", soilMoisture);

      if (Firebase.RTDB.setJSON(&fbdo, timestampPath.c_str(), &historyData))
      {
        Serial.print("Updated History with Timestamp ");
        Serial.println(timestampCounter);
        timestampCounter++;
      }
      else
      {
        Serial.print("Failed to update history: ");
        Serial.println(fbdo.errorReason());
      }
      lastHistoryUpdateTime = millis();
    }
  }
}

