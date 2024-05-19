import random

# Predefined list of words and their synonyms
words = {
    "happy": ["joyful", "cheerful", "content"],
    "sad": ["unhappy", "sorrowful", "downcast"],
    "angry": ["mad", "furious", "irate"]
}

def get_daily_word(words):
    return random.choice(list(words.keys()))

def display_synonyms(synonyms, guessed):
    display = []
    for synonym in synonyms:
        if synonym in guessed:
            display.append(synonym)
        else:
            display.append('_ ' * len(synonym))
    return ', '.join(display)

def main():
    daily_word = get_daily_word(words)
    synonyms = words[daily_word]
    guessed = set()

    print(f"Daily Word: {daily_word.capitalize()}")
    print(f"Synonyms: {display_synonyms(synonyms, guessed)}")

    while len(guessed) < len(synonyms):
        guess = input("> ").strip().lower()
        if guess in synonyms:
            guessed.add(guess)
            print("Correct!")
        else:
            print("Incorrect, try again.")
        
        print(f"Daily Word: {daily_word.capitalize()}")
        print(f"Synonyms: {display_synonyms(synonyms, guessed)}")

    print("Congratulations! You've guessed all the synonyms.")

if __name__ == "__main__":
    main()
