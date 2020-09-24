/*
todo post data to signal-media_
PUT /signal-media_
{
  "settings": {
    "index": {
      "similarity": {
        "my_similarity": {
          "type": "BM25",
          "k1": "1.2",
          "b": "0.75",
          "discount_overlaps": true
        }
      }
    },
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "type": "custom",
          "tokenizer": "whitespace",
          "filter": ["lowercase"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "text" },
      "source": {
        "type": "text",
        "analyzer": "my_custom_analyzer",
        "similarity" : "my_similarity"
      },
      "published": { "type": "text" },
      "title": {
        "type": "text",
        "analyzer": "my_custom_analyzer",
        "similarity" : "my_similarity"
      },
      "media-type": {
        "type": "text",
        "analyzer": "my_custom_analyzer",
        "similarity" : "my_similarity"
      },
      "content": {
        "type": "text",
        "analyzer": "my_custom_analyzer",
        "similarity" : "my_similarity"
      }
    }
  }
}
*/

// todo
export const getMAP = (): void => {

};

/*
topics for the testcollection:
-social media marketing
-doping sport
-google smartphone
-bitcoin stock market
*/
