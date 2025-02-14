import pygame
import pyaudio
import numpy as np
import time
import cv2
import speech_recognition as sr

# -----------------------------
# Pygame Setup
# -----------------------------
pygame.init()

# Screen settings
WIDTH, HEIGHT = 800, 600  # Change to horizontal resolution
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Voice Command Detection and Explosion Effect")

# Load sound effect
explosion_sound = pygame.mixer.Sound("sounds/explosion_sound.mp3")

# -----------------------------
# Speech Recognition Setup
# -----------------------------
recognizer = sr.Recognizer()
microphone = sr.Microphone()

# -----------------------------
# Functions
# -----------------------------

def detect_voice_command():
    """Detects the word 'ระเบิด' using speech recognition."""
    try:
        with microphone as source:
            print("Listening for the command 'ระเบิด'...")
            recognizer.adjust_for_ambient_noise(source)
            audio = recognizer.listen(source, timeout=5)
            command = recognizer.recognize_google(audio, language="th-TH")
            print(f"You said: {command}")
            if "ระเบิด" in command:
                print("Command 'ระเบิด' detected!")
                return "explosion"
    except sr.WaitTimeoutError:
        print("Listening timed out while waiting for command.")
    except sr.UnknownValueError:
        print("Could not understand the audio.")
    except sr.RequestError as e:
        print(f"Could not request results; {e}")
    return None


def play_explosion_video(video_path, duration=5):
    """Plays an explosion video on the screen for a limited duration."""
    explosion_cap = cv2.VideoCapture(video_path)

    # Check if the video file opened successfully
    if not explosion_cap.isOpened():
        print("Error: Cannot open video file.")
        return

    start_time = time.time()  # Record the start time

    # Play video frames
    while explosion_cap.isOpened():
        ret, frame = explosion_cap.read()
        if not ret or (time.time() - start_time) > duration:  # Break after duration or when video ends
            break

        # Resize the frame to fit the screen
        frame = cv2.resize(frame, (WIDTH, HEIGHT))

        # Rotate frame for proper orientation
        frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)
        frame = cv2.flip(frame, 1)  # Flip horizontally

        # Convert the frame from OpenCV (BGR) to Pygame (RGB)
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame_surface = pygame.surfarray.make_surface(frame)

        # Display the video frame on the screen
        screen.blit(frame_surface, (0, 0))
        pygame.display.update()

        # Add a small delay to match the frame rate
        time.sleep(1 / 30)  # Assuming 30 FPS for the video

    explosion_cap.release()

# -----------------------------
# Main Loop
# -----------------------------

running = True
while running:
    # Fill the screen with a black background
    screen.fill((0, 0, 0))

    # Check for events (e.g., quit)
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Detect voice command and trigger effect
    command = detect_voice_command()
    if command == "explosion":
        explosion_sound.play()
        play_explosion_video("explosion.mp4", duration=5)  # Replace with your video file

    # Update display
    pygame.display.update()

# -----------------------------
# Cleanup
# -----------------------------

# Quit Pygame
pygame.quit()
