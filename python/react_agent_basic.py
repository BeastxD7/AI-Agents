from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI()

result = llm.invoke("Hello")

print(result)