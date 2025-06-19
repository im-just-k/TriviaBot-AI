import openai

client = openai.OpenAI()
models = client.models.list()

for model in models.data:
    print(model.id)