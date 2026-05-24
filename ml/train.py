"""
Fruit Quality Detector — model training script
================================================
Trains a "fresh vs rotten" image classifier across MANY fruit types using
transfer learning (MobileNetV2). The number of output classes is detected
automatically from your folder structure, so you can add/remove fruits freely.

WHERE TO RUN THIS:
  - Best: Google Colab (free GPU). Runtime > Change runtime type > T4 GPU.
  - Or any machine with Python + a GPU.
  - It does NOT need to run inside the web app — it runs once, produces a
    model file, and that file is what the backend loads.

EXPECTED DATA LAYOUT (this is how the Kaggle datasets are usually arranged):

    data/
      train/
        freshapples/      img1.jpg img2.jpg ...
        rottenapples/     ...
        freshbanana/      ...
        rottenbanana/     ...
        ... (one folder per class — as many as you want)
      test/
        freshapples/      ...
        rottenapples/     ...
        ...

OUTPUT (everything the backend needs):
    model/fruit_model.keras   <- the trained model
    model/class_names.json    <- label order, so the backend knows what index means what
"""

import json
import os

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# ----------------------------------------------------------------------------
# 1. CONFIG — edit these paths to match where your dataset lives
# ----------------------------------------------------------------------------
TRAIN_DIR = "data/train"      # folder of class-subfolders for training
TEST_DIR = "data/test"        # folder of class-subfolders for validation/testing
OUTPUT_DIR = "model"          # where the trained model + labels are saved

IMG_SIZE = (224, 224)         # MobileNetV2's native input size
BATCH_SIZE = 32
INITIAL_EPOCHS = 10           # training with the base model frozen
FINE_TUNE_EPOCHS = 5          # extra training that unfreezes part of the base
SEED = 123

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ----------------------------------------------------------------------------
# 2. LOAD DATA — Keras reads the folder names as class labels automatically
# ----------------------------------------------------------------------------
train_ds = keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="categorical",
    shuffle=True,
    seed=SEED,
)

val_ds = keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="categorical",
    shuffle=False,
)

class_names = train_ds.class_names
num_classes = len(class_names)
print(f"Detected {num_classes} classes: {class_names}")

# Save the label order immediately — the backend relies on this file
with open(os.path.join(OUTPUT_DIR, "class_names.json"), "w") as f:
    json.dump(class_names, f, indent=2)

# Speed up data loading
AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)

# ----------------------------------------------------------------------------
# 3. BUILD MODEL
#    - data augmentation: only active during training, helps avoid overfitting
#    - Rescaling(1/127.5, -1): exactly the [-1, 1] scaling MobileNetV2 expects,
#      baked INTO the model so inference needs no extra preprocessing
# ----------------------------------------------------------------------------
data_augmentation = keras.Sequential(
    [
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.15),
        layers.RandomZoom(0.15),
    ],
    name="data_augmentation",
)

base_model = keras.applications.MobileNetV2(
    input_shape=IMG_SIZE + (3,),
    include_top=False,      # drop ImageNet's 1000-class head; we add our own
    weights="imagenet",
)
base_model.trainable = False  # freeze for the first training phase

inputs = keras.Input(shape=IMG_SIZE + (3,))
x = data_augmentation(inputs)
x = layers.Rescaling(scale=1.0 / 127.5, offset=-1)(x)   # 0..255 -> -1..1
x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.2)(x)
outputs = layers.Dense(num_classes, activation="softmax")(x)
model = keras.Model(inputs, outputs)

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)
model.summary()

# ----------------------------------------------------------------------------
# 4. PHASE 1 — train only the new head
# ----------------------------------------------------------------------------
print("\n=== Phase 1: training classification head ===")
model.fit(train_ds, validation_data=val_ds, epochs=INITIAL_EPOCHS)

# ----------------------------------------------------------------------------
# 5. PHASE 2 — fine-tune: unfreeze the top of the base for a small accuracy bump
# ----------------------------------------------------------------------------
print("\n=== Phase 2: fine-tuning top layers ===")
base_model.trainable = True
# Keep the early (generic) layers frozen; only fine-tune the last ~30
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=1e-5),  # low LR for fine-tuning
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)
model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=INITIAL_EPOCHS + FINE_TUNE_EPOCHS,
    initial_epoch=INITIAL_EPOCHS,
)

# ----------------------------------------------------------------------------
# 6. SAVE
# ----------------------------------------------------------------------------
model_path = os.path.join(OUTPUT_DIR, "fruit_model.keras")
model.save(model_path)
print(f"\nDone. Saved model to {model_path}")
print(f"Saved labels to {os.path.join(OUTPUT_DIR, 'class_names.json')}")
print("Download the entire 'model/' folder and put it in your project.")
