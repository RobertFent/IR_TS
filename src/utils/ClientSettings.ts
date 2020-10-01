const lmSimilarity = {
    similarity: {
        my_similarity: {
            type: 'LMDirichlet',
            mu: '2000'
        }
    }

};

// do not combine w/ stopword removal
const dfiSimilarity = {
    similarity: {
        my_similarity: {
            type: 'DFI',
            independence_measure: 'standardized'
        }
    }
};

const idfSimilarity = {
    similarity: {
        my_similarity: {
            type: 'BM25',
            k1: '1.2',
            b: '0.75',
            discount_overlaps: true
        }
    }
};

const defaultAnalyzer = {
    analyzer: {
        my_custom_analyzer: {
            type: 'standard'
        }
    }
};

const stopwordRemovalAnalyzer = {
    analyzer: {
        my_custom_analyzer: {
            type: 'stop'
        }
    }
};

const customAnalyzer = {
    analyzer: {
        my_custom_analyzer: {
            type: 'custom',
            tokenizer: 'whitespace',
            filter: ['lowercase']
        }
    }
};

export const Similarities = {
    lm: lmSimilarity,
    dfi: dfiSimilarity,
    idf: idfSimilarity  
};

export const Analyzer = {
    default: defaultAnalyzer,
    stopword: stopwordRemovalAnalyzer,
    custom: customAnalyzer
};
