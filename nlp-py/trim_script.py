from pydub import AudioSegment

# Load the input MP3 file
input_file = "c:/users/owner/downloads/1.mp3"
output_file = "./2.mp3"

# Load the audio file
audio = AudioSegment.from_mp3(input_file)

# Trim the audio to the first 15 minutes (15 * 60 * 1000 milliseconds)
trimmed_audio = audio[:15 * 60 * 1000]

# Export the trimmed audio
trimmed_audio.export(output_file, format="mp3")

print("MP3 file successfully trimmed to 15 minutes")
