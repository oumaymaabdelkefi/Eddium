export async function fetchWordDefinition(word) {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase().trim()}`
    );

    if (!response.ok) {
      return { success: false, error: 'Word not found' };
    }

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
      success:      true,
      word:         entry.word,
      phonetic:     entry.phonetic || '',
      audio:        entry.phonetics?.find(p => p.audio)?.audio || null,
      definitions:  definitions.slice(0, 4),
      origin:       entry.origin || null,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}