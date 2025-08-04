# AI Agent Server Architecture Design

## 1. Introduction

This document outlines the architectural design for the AI Agent Server, a backend system built with TypeScript (Node.js) that integrates an LLM-based agent core, a Retrieval-Augmented Generation (RAG) system, and a pluggable execution system. The server is designed to be dynamic, allowing for the incorporation of additional tools and leveraging AI intelligence with proper RAG and system prompts. This design aims to meet the requirements specified in the internship assignment, focusing on modularity, scalability, and maintainability.




## 2. System Requirements and Components

### 2.1. Agent Core (LLM-based)

The core of the system will be an LLM-based agent responsible for processing user messages and generating intelligent replies. It will expose a `POST /agent/message` endpoint that accepts a `message` string and a `session_id` string. The `session_id` will be crucial for maintaining conversational memory, ensuring that the AI's responses are contextually relevant to prior interactions within the same session.

- **Endpoint**: `POST /agent/message`
- **Inputs**: `message` (string), `session_id` (string)
- **Output**: AI's reply (string)
- **LLM Integration**: The system will utilize **Groq** as the primary LLM provider, leveraging its capabilities for efficient and relevant response generation. The API key for Groq will be securely managed using environment variables.
- **Session Memory**: A key feature of the agent core is its ability to maintain memory per session. This will be achieved by storing prior messages associated with each `session_id`. For simplicity and initial implementation, this memory can be stored in-memory or a simple file-based storage, with considerations for a more robust database solution for production environments.

### 2.2. Contextual RAG (Retrieval-Augmented Generation)

To enhance the LLM's responses with external knowledge, a Contextual RAG system will be implemented. This system will allow the agent to retrieve relevant information from a knowledge base of markdown/text files and inject it into the LLM's prompt as system context. This ensures that the AI's responses are not only intelligent but also factual and informed by specific domain knowledge.

- **Knowledge Base**: The system will store at least five markdown/text files (e.g., tech docs, blog posts) as its knowledge base. These files will be pre-processed for efficient retrieval.
- **Embedding**: Upon receiving a user message, the message will be embedded into a vector representation. This embedding process will allow for semantic similarity searches against the knowledge base.
- **Retrieval**: The system will retrieve the top 3 most relevant chunks from the knowledge base based on the embedded user message. The retrieval mechanism will initially involve a basic vector search logic, potentially using cosine similarity on pre-computed embeddings of the document chunks.
- **Context Injection**: The retrieved chunks will be fed into the LLM prompt as system context, providing the LLM with relevant information to formulate its response. This process is critical for reducing hallucinations and grounding the AI's output in factual data.

### 2.3. Plugin Execution System

The agent will be capable of triggering simple plugins based on user intent, extending its functionality beyond conversational responses. This pluggable system allows for dynamic interaction with external services or internal utilities.

- **Intent Parsing**: The agent will parse user messages to identify specific intents that can be fulfilled by available plugins. This will likely involve a combination of keyword matching and LLM-based intent recognition.
- **Plugin Invocation**: Once an intent is identified, the corresponding plugin will be called with the necessary parameters extracted from the user's message.
- **Result Injection**: The output from the plugin execution will be injected into the final LLM response, allowing the agent to provide dynamic and actionable information.
- **Implemented Plugins (Initial)**:
    - **Weather Plugin**: This plugin will interact with the OpenWeather API to fetch current weather information for a specified location. The OpenWeather API key will be managed securely.
    - **Math Evaluator Plugin**: This plugin will be capable of evaluating mathematical expressions (e.g., `2 + 2 * 5`). It will handle basic arithmetic operations and return the computed result.

### 2.4. Prompt Engineering

Effective prompt engineering is crucial for guiding the LLM's behavior and ensuring high-quality responses. The system will utilize custom-designed system prompts that dynamically incorporate various contextual elements.

- **System Instructions**: The prompt will include clear system instructions for the agent, defining its persona, objectives, and constraints.
- **Memory Summary**: A summary of the last two messages in the conversation history will be included in the prompt to provide short-term memory to the LLM.
- **Retrieved Chunks**: The top 3 relevant chunks retrieved from the RAG system will be dynamically inserted into the prompt, providing the LLM with factual context.
- **Plugin Outputs**: If a plugin is invoked, its output will be seamlessly integrated into the prompt, allowing the LLM to incorporate real-time data or computed results into its response.




## 3. Technical Stack

- **Language**: The entire backend system will be developed in **TypeScript**, ensuring type safety, better code organization, and improved maintainability. This aligns with modern backend development practices and facilitates collaboration.
- **Framework**: **Express.js** will be used as the web application framework. Its minimalist and flexible nature allows for rapid development of robust APIs and middleware. Express.js is a popular choice in the Node.js ecosystem, providing a solid foundation for building scalable backend services.
- **Vector DB**: For the Contextual RAG system, a custom vector search logic will be implemented. This will involve storing document chunks and their embeddings, and performing similarity searches using **cosine similarity** on these embeddings. This approach avoids external database dependencies for the vector store, simplifying deployment and management for this assignment. The embeddings themselves will be generated using a suitable embedding model, likely provided by Groq or OpenAI.
- **LLM**: **Groq** will be the primary Large Language Model (LLM) provider. Groq offers fast inference speeds, which is beneficial for real-time agent interactions. The `groq-sdk` will be used for seamless integration. The API key will be managed via environment variables.
- **Hosting**: The application will be designed for deployment on cloud platforms such as **AWS EC2 or Lambda**. The architecture will consider statelessness where appropriate and leverage containerization (e.g., Docker) for consistent deployment environments, although direct deployment to EC2 will be the initial target for simplicity.

## 4. Submission Requirements

Upon completion, the project will adhere to the following submission requirements:

- **GitHub Repository**: A public GitHub repository will host the clean, well-typed, and modular codebase. The repository structure will be intuitive, making it easy to navigate and understand the project.
- **`README.md`**: A comprehensive `README.md` file will be provided at the root of the repository. This file will include:
    - Detailed setup instructions for local development and deployment.
    - Sample `curl` or Postman commands to interact with the exposed API endpoints.
    - A clear explanation of the agent's architecture and overall flow, potentially including diagrams.
- **`NOTES.md`**: A `NOTES.md` file will document key aspects of the development process:
    - Clear demarcation of AI-generated code snippets or content versus human-written parts.
    - A log of bugs encountered during development and their respective solutions.
    - An in-depth explanation of how the agent routes plugin calls, manages memory, and injects contextual information from the RAG system.
- **Live Deployed URL**: A live, publicly accessible URL will be provided, demonstrating the fully functional backend system with working endpoints. This will serve as the primary deliverable for evaluation.

## 5. Evaluation Criteria

The project will be evaluated based on the following criteria:

| Area                  | What We’re Looking For                                        |
| :-------------------- | :------------------------------------------------------------ |
| **Code Quality**      | Typed, modular, scalable, no mess                             |
| **Prompt Design**     | Custom system prompts with memory, plugin & context injection |
| **Plugin Logic**      | Clear agent → plugin → LLM loop                               |
| **RAG Workflow**      | Solid retrieval setup (chunking, embedding, query flow)       |
| **Vibe Coding Depth** | Knowing when to guide AI vs when to override                  |
| **Ownership**         | Speed, clarity, docs, and full working app                    |

This design document serves as a blueprint for the development of the AI Agent Server, ensuring all requirements are met and the system is built on a robust and scalable foundation.


