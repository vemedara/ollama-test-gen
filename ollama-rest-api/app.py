import json
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin # type: ignore
from OllamaModelLoader import OllamaModelLoader

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
cors = CORS(app)
domain_info:str = None

with open('context.txt', 'r') as file:
    domain_info = file.read().rstrip()

# load Ollama llava model using OllamaModelLoader
ollama_loader_llava = OllamaModelLoader('ollama_config_llava.json')
mllm_llava = ollama_loader_llava.load_ollama_model()
query_llava = "[no prose], [Output only JSON], Write all possible QA 'Test cases' for the given images of clinical data collection web application, in a single JSON format to validate in clinical data, make these as json keys for each test case : 'Test Case ID' 'Description of the Test Case' 'Steps to Perform the Test Case' 'Expected Result' 'Actual Results', in 'Actual Results' put \"TODO\": \"To be Tested\""
print("prompt : {}".format(query_llava))

# load Ollama llama model using OllamaModelLoader
ollama_loader_llama = OllamaModelLoader('ollama_config_llama.json')
mllm_llama = ollama_loader_llama.load_ollama_model()


# Dummy function to represent interaction with the Ollama LLAVA model
def interact_with_ollama_llava_model(image_base64=[]):
    llm_with_image_context = mllm_llava.bind(images=image_base64)
    response_text = llm_with_image_context.invoke(query_llava)
    return response_text

# Dummy function to represent interaction with the Ollama LLAMA model
def interact_with_ollama_llama_model(input_text):
    query_llama = "[no prose] [Output only JSON] Write all possible QA 'Test cases' for the clinical data collection web application in a single JSON format to validate {} in clinical data, make these as json keys for each test case : 'Test Case ID' 'Description of the Test Case' 'Steps to Perform the Test Case' 'Expected Result' 'Actual Results', in 'Actual Results' put \"TODO\": \"To be Tested\"".format(input_text)
    # llm_with_context = mllm_llama.bind(text=[domain_info])
    response_text = mllm_llama.invoke(query_llama)
    return response_text

@app.route('/api/v1/interact/llava', methods=['POST'])
@cross_origin()
def interact_llava():
    data = request.get_json()
    if not data or 'input_text' not in data:
        return jsonify({"error": "Invalid input"}), 400
    input_text = []
    input_text.append(str.replace(data['input_text'],'data:image/png;base64,',''))
    response_text = interact_with_ollama_llava_model(input_text)
    sub1:str = '[\n'
    sub2:str = ']\n'
    res = response_text[response_text.find(sub1):response_text.rfind(sub2)+len(sub2)]
    return json.loads(res)

@app.route('/api/v1/interact/llama', methods=['POST'])
@cross_origin()
def interact_llama():
    data = request.get_json()
    if not data or 'input_text' not in data:
        return jsonify({"error": "Invalid input"}), 400
    input_text = data['input_text']
    response_text:str = interact_with_ollama_llama_model(input_text)
    sub1:str = '[\n'
    sub2:str = ']\n'
    res = response_text[response_text.find(sub1):response_text.rfind(sub2)+len(sub2)]
    return json.loads(res)

if __name__ == '__main__':
    app.run(port=8000, debug=True)
