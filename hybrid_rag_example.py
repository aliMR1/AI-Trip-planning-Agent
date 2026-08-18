"""
Hybrid RAG Example: Dense (Vector) + Sparse (BM25) Retrieval
Using LangChain with FAISS + BM25
"""

from langchain_community.vectorstores import FAISS
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


# 1. Sample Documents (healthcare domain)
docs = [
    Document(
        page_content="Patient presents with acute chest pain radiating to left arm. ECG shows ST elevation in leads V1-V4. Diagnosed with anterior STEMI. Treated with primary PCI and dual antiplatelet therapy.",
        metadata={"source": "cardiology_note_1.txt", "patient_id": "P001"}
    ),
    Document(
        page_content="Type 2 diabetes mellitus management: HbA1c 8.2%. Started on metformin 1000mg BID. Lifestyle counseling provided. Follow-up in 3 months for HbA1c recheck.",
        metadata={"source": "endocrine_note_1.txt", "patient_id": "P002"}
    ),
    Document(
        page_content="Hypertension follow-up: BP 145/92 on current regimen. Added amlodipine 5mg daily. Renal function normal. Patient advised low-sodium diet and home BP monitoring.",
        metadata={"source": "primary_care_1.txt", "patient_id": "P003"}
    ),
    Document(
        page_content="Acute coronary syndrome protocol: Immediate aspirin 325mg, P2Y12 inhibitor, anticoagulation. Early invasive strategy within 24 hours for high-risk patients. Contraindications: active bleeding, severe thrombocytopenia.",
        metadata={"source": "protocol_acs.txt"}
    ),
    Document(
        page_content="Diabetic ketoacidosis (DKA) treatment: IV fluids 1L/hr initially, insulin drip 0.1 units/kg/hr, potassium replacement per serum levels. Monitor glucose q1hr, ketones q2hr. Resolution criteria: glucose <200, anion gap closed, bicarbonate >15.",
        metadata={"source": "protocol_dka.txt"}
    ),
]


def build_hybrid_retriever(documents, dense_weight=0.5, sparse_weight=0.5):
    """
    Build a hybrid retriever combining FAISS (dense) + BM25 (sparse).
    """
    # Split documents
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    splits = splitter.split_documents(documents)

    # --- DENSE: FAISS Vector Store ---
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = FAISS.from_documents(splits, embeddings)
    dense_retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

    # --- SPARSE: BM25 Retriever ---
    sparse_retriever = BM25Retriever.from_documents(splits)
    sparse_retriever.k = 5

    # --- HYBRID: Ensemble (Reciprocal Rank Fusion) ---
    hybrid_retriever = EnsembleRetriever(
        retrievers=[dense_retriever, sparse_retriever],
        weights=[dense_weight, sparse_weight]
    )

    return hybrid_retriever, dense_retriever, sparse_retriever


def demo_retrieval():
    """Compare dense vs sparse vs hybrid retrieval."""
    hybrid, dense, sparse = build_hybrid_retriever(docs)

    queries = [
        "STEMI treatment protocol",           # Medical term - dense better
        "PCI dual antiplatelet therapy",      # Exact acronyms - sparse better
        "metformin dosage diabetes",          # Mixed
        "DKA insulin drip protocol",          # Exact protocol name
        "hypertension amlodipine dosage",     # Drug name - sparse better
    ]

    for query in queries:
        print(f"\n{'='*60}")
        print(f"QUERY: {query}")
        print(f"{'='*60}")

        dense_results = dense.invoke(query)
        sparse_results = sparse.invoke(query)
        hybrid_results = hybrid.invoke(query)

        print(f"\n🔵 DENSE (FAISS) - Top 3:")
        for i, d in enumerate(dense_results[:3], 1):
            print(f"  {i}. [{d.metadata.get('source', 'N/A')}] {d.page_content[:100]}...")

        print(f"\n🟢 SPARSE (BM25) - Top 3:")
        for i, d in enumerate(sparse_results[:3], 1):
            print(f"  {i}. [{d.metadata.get('source', 'N/A')}] {d.page_content[:100]}...")

        print(f"\n🟣 HYBRID (Ensemble) - Top 3:")
        for i, d in enumerate(hybrid_results[:3], 1):
            print(f"  {i}. [{d.metadata.get('source', 'N/A')}] {d.page_content[:100]}...")


if __name__ == "__main__":
    demo_retrieval()