const prefix = 'http://www.kr2022.com/snowman#'

// transforme une URI en ID
// exemple : http://www.kr2022.com/snowman#cell45 -> cell45
export function uriToId(uri){
    return uri.substring(prefix.length)
}

export function extractData(bindings) {
    if (bindings.length === 0) return {};
  
    const extractedData = {};
    bindings.forEach(binding => {
      Object.entries(binding).forEach(([key, value]) => {
        extractedData[key] = uriToId(value.value);
      });
    });
  
    return extractedData;
  }
  