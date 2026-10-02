// Local fallback definitions for common IELTS words
const LOCAL_DEFINITIONS = {
  ambiguous: {
    word: 'ambiguous',
    phonetic: '/æmˈbɪɡjuəs/',
    definitions: [{
      partOfSpeech: 'adjective',
      definition: 'Open to more than one interpretation; not having one obvious meaning.',
      example: 'The politician gave an ambiguous answer to the question.',
      synonyms: ['unclear', 'vague', 'uncertain', 'dubious'],
    }],
  },
  eloquent: {
    word: 'eloquent',
    phonetic: '/ˈeləkwənt/',
    definitions: [{
      partOfSpeech: 'adjective',
      definition: 'Fluent or persuasive in speaking or writing.',
      example: 'She gave an eloquent speech that moved the audience.',
      synonyms: ['articulate', 'persuasive', 'expressive', 'fluent'],
    }],
  },
  tenacious: {
    word: 'tenacious',
    phonetic: '/təˈneɪʃəs/',
    definitions: [{
      partOfSpeech: 'adjective',
      definition: 'Persistent and determined; not giving up easily.',
      example: 'He was tenacious in his pursuit of success.',
      synonyms: ['persistent', 'determined', 'stubborn', 'resolute'],
    }],
  },
  concise: {
    word: 'concise',
    phonetic: '/kənˈsaɪs/',
    definitions: [{
      partOfSpeech: 'adjective',
      definition: 'Giving a lot of information clearly and in a few words; brief but comprehensive.',
      example: 'Please write a concise summary of the article.',
      synonyms: ['brief', 'succinct', 'short', 'compact'],
    }],
  },
  diligent: {
    word: 'diligent',
    phonetic: '/ˈdɪlɪdʒənt/',
    definitions: [{
      partOfSpeech: 'adjective',
      definition: 'Having or showing care and conscientiousness in one\'s work or duties.',
      example: 'She was diligent in her studies and always completed her homework.',
      synonyms: ['hardworking', 'industrious', 'assiduous', 'careful'],
    }],
  },
  meticulous: {
    word: 'meticulous',
    phonetic: '/məˈtɪkjʊləs/',
    definitions: [{
      partOfSpeech: 'adjective',
      definition: 'Showing great attention to detail or being very careful and precise.',
      example: 'The surgeon was meticulous in his preparation for the operation.',
      synonyms: ['careful', 'precise', 'thorough', 'scrupulous'],
    }],
  },
  pragmatic: {
    word: 'pragmatic',
    phonetic: '/præɡˈmætɪk/',
    definitions: [{
      partOfSpeech: 'adjective',
      definition: 'Dealing with things sensibly and realistically in a practical way.',
      example: 'We need a pragmatic approach to solving this problem.',
      synonyms: ['practical', 'realistic', 'sensible', 'rational'],
    }],
  },
  persevere: {
    word: 'persevere',
    phonetic: '/ˌpɜːsɪˈvɪər/',
    definitions: [{
      partOfSpeech: 'verb',
      definition: 'To continue in a course of action even in the face of difficulty.',
      example: 'You must persevere if you want to achieve your goals.',
      synonyms: ['persist', 'continue', 'endure', 'carry on'],
    }],
  },
  coherent: {
    word: 'coherent',
    phonetic: '/kəʊˈhɪərənt/',
    definitions: [{
      partOfSpeech: 'adjective',
      definition: 'Logical and consistent; forming a unified whole.',
      example: 'She presented a coherent argument for her position.',
      synonyms: ['logical', 'consistent', 'clear', 'reasoned'],
    }],
  },
  diverse: {
    word: 'diverse',
    phonetic: '/daɪˈvɜːs/',
    definitions: [{
      partOfSpeech: 'adjective',
      definition: 'Showing a great deal of variety; very different from each other.',
      example: 'The city has a diverse population from many cultures.',
      synonyms: ['varied', 'different', 'mixed', 'assorted'],
    }],
  },
};

export async function fetchWordDefinition(word) {
  const key = word.toLowerCase().trim();

  // Try external API first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${key}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const entry = data[0];
      const definitions = [];

      entry.meanings?.forEach(meaning => {
        meaning.definitions?.slice(0, 2).forEach(def => {
          definitions.push({
            partOfSpeech: meaning.partOfSpeech,
            definition:   def.definition,
            example:      def.example || null,
            synonyms:     def.synonyms?.slice(0, 4) || [],
          });
        });
      });

      return {
        success:     true,
        word:        entry.word,
        phonetic:    entry.phonetic || '',
        definitions: definitions.slice(0, 4),
        origin:      entry.origin || null,
      };
    }
  } catch (error) {
    console.log('API unavailable — using local definition:', error.message);
  }

  // Fallback to local definitions
  if (LOCAL_DEFINITIONS[key]) {
    return {
      success:  true,
      ...LOCAL_DEFINITIONS[key],
      isLocal:  true,
    };
  }

  // Generic fallback
  return {
    success:  true,
    word:     word,
    phonetic: '',
    definitions: [{
      partOfSpeech: 'vocabulary',
      definition:   `"${word}" is an IELTS vocabulary word you learned during a battle. Look it up in a dictionary for the full definition.`,
      example:      null,
      synonyms:     [],
    }],
    isLocal: true,
  };
}