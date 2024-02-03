#include <DHT_U.h>
#include <Energia.h>

#define DHTPIN   11   // Pin collegato al sensore DHT
#define RX_PIN   3    // Pin RX
#define TX_PIN   4    // Pin TX

#define DHTTYPE  DHT11 // Tipo di sensore DHT

#define TRIG_PIN 39     // Pin per il trigger del sensore ultrasonico
#define ECHO_PIN 40     // Pin per l'eco del sensore ultrasonico

DHT_Unified dht(DHTPIN, DHTTYPE);

int distance = 0;
int closed = 1;
int counter = 0;

void initiateTrigger() {
  // Codice di inizializzazione del trigger qui
  pinMode(TRIG_PIN, OUTPUT);
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
}

void setup() {
  Serial.begin(9600);
  Serial1.begin(9600);

  pinMode(TRIG_PIN, OUTPUT); // Aggiunto il pin del trigger come output
  pinMode(ECHO_PIN, INPUT);  // Aggiunto il pin dell'eco come input

  initiateTrigger(); // Inizializza il trigger per il sensore ultrasonico

  dht.begin();
  delay(1000);
}

void loop() {

  if (counter == 50) {
    sensors_event_t event;
    // Read temperature value
    dht.temperature().getEvent(&event);
    // If the temperature value is not a number
    if (isnan(event.temperature)) {
      Serial1.print("{ \"type\" : \"temperature\", \"value\" : ");
      Serial1.print("undefined");
      Serial1.println(" }");
      Serial1.println('\0');
    }
    // Otherwise, print the temperature value
    else {
      Serial1.print("{ \"type\" : \"temperature\", \"value\" : ");
      Serial1.print(event.temperature);
      Serial1.println(" }");
      Serial1.println('\0');
    }

    // Read humidity value
    dht.humidity().getEvent(&event);
    // If the humidity value is not a number
    if (isnan(event.relative_humidity)) {
      Serial1.print("{ \"type\" : \"humidity\", \"value\" : ");
      Serial1.print("undefined");
      Serial1.println(" }");
      Serial1.println('\0');
    }
    // Otherwise, print the humidity value
    else {
      Serial1.print("{ \"type\" : \"humidity\", \"value\" : ");
      Serial1.print(event.relative_humidity);
      Serial1.println(" }");
      Serial1.println('\0');
    }
    counter = 0;
  }

  // Misurazione della distanza ultrasonica
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  unsigned long pulseDuration = pulseIn(ECHO_PIN, HIGH);
  distance = pulseDuration * 0.0343 / 2; // Distance in centimeters

  if (distance <= 4 && closed == 0) {
    Serial1.println("{ \"type\" : \"door\", \"value\" : \"closed\" }");
    Serial1.println('\0');
    closed = 1;
  } else if (distance > 4 && closed == 1) {
    Serial1.println("{ \"type\" : \"door\", \"value\" : \"open\" }");
    Serial1.println('\0');
    closed = 0;
  }

  delay(100);
  counter ++;
}
