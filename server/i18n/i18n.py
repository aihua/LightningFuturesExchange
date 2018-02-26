from flask import request
import json

translations = None
languages = None


def __load_languages():
    global languages, translations
    languages = ['en, fr']
    translations = json.load(open('translations/translations.json'))


def get_text(control, item, language=''):
    if translations is None:
        __load_languages()

    if language == '':
        if request is not None and 'language' in request.cookies:
            language = request.cookies.get('language', 'en')
        else:
            language = 'en'

        if language not in languages:
            language = 'en'

        if control in translations[language] and item in translations[language][control]:
            return translations[language][control][item]
        else:
            return control + '_' + item
