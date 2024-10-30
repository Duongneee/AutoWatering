#include <Wire.h>
#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// WiFi Information
#define WIFI_SSID "VIETTEL_U2uzuet6"
#define WIFI_PASSWORD "Duongquach02"
//DCE-Office   kythumati

// Firebase Information
#define API_KEY "AIzaSyALwBsc9XNs9O4JG1QIG494XUPXhCF1CnM"
#define USER_EMAIL "duongquach2k3@gmail.com"
#define USER_PASSWORD "Duongquach02"
#define DATABASE_URL "https://auto-watering-7c50f-default-rtdb.europe-west1.firebasedatabase.app/"

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Database Paths
const String moisturePath = "gardens/gardenId1/doAmDat/current";
const String pumpStatusPath = "gardens/gardenId1/mayBom/trangThai";

// Pin Definitions
const int pumpPin = 4;
const int moistureSensorPin = 33;

bool signUp = false;
bool autoControl = false;

// functions
void connectToWifi();
void connectToFirebase();
void configListener();
void autoControlling();
void sendingData();
int readSoilMoisture();

void setup() {
  Serial.begin(115200);
  pinMode(pumpPin, OUTPUT);
  pinMode(moistureSensorPin, INPUT);
  
  connectToWifi();
  connectToFirebase();
}

void loop() {
  configListener();
  autoControlling();
  sendingData();
}

// Connect to WiFi
void connectToWifi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("\nConnecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".,.");
    delay(300);
  }
  Serial.print("\nWiFi connected with IP: ");
  Serial.println(WiFi.localIP());
}

// Connect to Firebase
void connectToFirebase() {
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  
  Firebase.reconnectWiFi(true);
  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  
  if (Firebase.ready() && Firebase.RTDB.setInt(&fbdo, moisturePath.c_str(), readSoilMoisture())) {
    Serial.println("Firebase connected and initial data set.");
    signUp = true;
  } else {
    Serial.printf("Firebase connect error: %s\n", fbdo.errorReason().c_str());
  }
}

// Read soil moisture value
int readSoilMoisture() {
  int sensorValue = analogRead(moistureSensorPin);
  return map(sensorValue, 1600, 4095, 100, 0); // Adjusting based on sensor values
}

// Config listener to check pump mode and control the pump
void configListener() {
  if (Firebase.ready() && signUp) {
    if (Firebase.RTDB.getInt(&fbdo, pumpStatusPath.c_str())) {
      int pumpState = fbdo.intData();
      Serial.print("Pump State from Firebase: ");
      Serial.println(pumpState);

      if (pumpState == 1) {
        digitalWrite(pumpPin, HIGH);
        Serial.println("Pump ON");
        autoControl = false;
      } else if (pumpState == 0) {
        digitalWrite(pumpPin, LOW);
        Serial.println("Pump OFF");
        autoControl = false;
      } else if (pumpState / 10 == 2) {
        autoControl = true;
        Serial.println("Pump in AUTO mode");
      }
    }
  } else {
    Serial.println("Firebase disconnected");
  }
}

// Auto control pump based on soil moisture
void autoControlling() {
  if (autoControl) {
    int soilMoisture = readSoilMoisture();
    int newPumpStatus;
    
    if (soilMoisture >30 ) {
      digitalWrite(pumpPin, LOW);
      Serial.println("Pump OFF (Auto Mode)");
      newPumpStatus = 20; // Tự động, máy bơm Tắt
    } else {
      digitalWrite(pumpPin, HIGH);
      Serial.println("Pump ON (Auto Mode)");
      newPumpStatus = 21; // Tự động, máy bơm Bật
    }
    
    // Gửi trạng thái mới lên Firebase
    if (Firebase.ready() && signUp) {
      Firebase.RTDB.setInt(&fbdo, pumpStatusPath.c_str(), newPumpStatus);
    }
  }
}

// Send soil moisture data to Firebase
void sendingData() {
  static unsigned long lastSendTime = 0;
  if (Firebase.ready() && signUp && millis() - lastSendTime > 10000) {
    int soilMoisture = readSoilMoisture();
    if (Firebase.RTDB.setInt(&fbdo, moisturePath.c_str(), soilMoisture)) {
      Serial.print("Sent Soil Moisture: ");
      Serial.println(soilMoisture);
    } else {
      Serial.print("Failed to send data: ");
      Serial.println(fbdo.errorReason());
    }
    lastSendTime = millis();
  }
}
