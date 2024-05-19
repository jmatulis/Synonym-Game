from flask import Flask, jsonify, request
import datetime
import random

app = Flask(__name__)

words_with_synonyms = {
    "happy": ["Joyful", "Content", "Cheerful", "Delighted", "Pleased", "Ecstatic", "Jubilant"],
    "sad": ["Unhappy", "Sorrowful", "Depressed", "Melancholy", "Gloomy", "Mournful", "Despondent"],
    "angry": ["Furious", "Irate", "Enraged", "Annoyed", "Mad", "Wrathful", "Indignant"],
    "big": ["Large", "Huge", "Enormous", "Massive", "Gigantic", "Colossal", "Immense"],
    "small": ["Tiny", "Miniature", "Little", "Petite", "Minuscule", "Microscopic", "Compact"],
    "fast": ["Quick", "Rapid", "Speedy", "Swift", "Hasty", "Brisk", "Expeditious"],
    "slow": ["Sluggish", "Lethargic", "Unhurried", "Delayed", "Leisurely", "Lagging", "Tardy"],
    "smart": ["Intelligent", "Bright", "Clever", "Brilliant", "Sharp", "Wise", "Knowledgeable"],
    "dumb": ["Stupid", "Foolish", "Ignorant", "Dense", "Dull", "Brainless", "Unintelligent"],
    "strong": ["Powerful", "Sturdy", "Robust", "Mighty", "Vigorous", "Tough", "Resilient"],
    "weak": ["Frail", "Feeble", "Delicate", "Fragile", "Infirm", "Lame", "Debilitated"],
    "beautiful": ["Pretty", "Lovely", "Gorgeous", "Attractive", "Stunning", "Handsome", "Alluring"],
    "ugly": ["Unattractive", "Hideous", "Homely", "Plain", "Unsightly", "Repulsive", "Grotesque"],
    "rich": ["Wealthy", "Affluent", "Prosperous", "Well-off", "Opulent", "Loaded", "Flush"],
    "poor": ["Impoverished", "Destitute", "Needy", "Penniless", "Indigent", "Broke", "Penurious"],
    "clean": ["Spotless", "Pristine", "Tidy", "Neat", "Immaculate", "Pure", "Sterile"],
    "dirty": ["Filthy", "Grimy", "Soiled", "Polluted", "Contaminated", "Squalid", "Unclean"],
    "brave": ["Courageous", "Fearless", "Bold", "Heroic", "Valiant", "Daring", "Gallant"],
    "cowardly": ["Fearful", "Timid", "Afraid", "Spineless", "Gutless", "Pusillanimous", "Craven"],
    "easy": ["Simple", "Effortless", "Straightforward", "Uncomplicated", "Painless", "Smooth", "Undemanding"]
}

def get_daily_word(seed=None):
    if seed is None:
        today = datetime.date.today()
        seed = today.year * 1000 + today.timetuple().tm_yday

    word_list = list(words_with_synonyms.keys())
    random.Random(seed).shuffle(word_list)

    day_of_year = datetime.date.today().timetuple().tm_yday
    word_index = day_of_year % len(word_list)
    word = word_list[word_index]
    synonyms = words_with_synonyms[word]
    return word.capitalize(), synonyms

@app.route('/daily_word', methods=['GET'])
def daily_word():
    word, synonyms = get_daily_word()
    return jsonify({'daily_word': word, 'synonyms': synonyms})

@app.route('/guess', methods=['POST'])
def guess():
    data = request.json
    guess = data.get('guess').lower()
    word, synonyms = get_daily_word()
    result = 'incorrect'
    if guess in [s.lower() for s in synonyms]:
        result = 'correct'
        guessed.add(guess)
        if all(syn.lower() in guessed for syn in synonyms):
            result = 'win'
    return jsonify({'result': result, 'guess': guess})

if __name__ == '__main__':
    guessed = set()
    app.run(debug=True)
