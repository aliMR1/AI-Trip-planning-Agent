"""
Advanced Hybrid RAG: Custom Reciprocal Rank Fusion (RRF)
Manual implementation for full control over fusion logic.
"""

from typing import List, Dict, Any
from langchain_community.vectorstores import FAISS
from langchain_community.retrievers import BM25Retriever
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
import numpy as np


def reciprocal_rank_fusion(
    result_lists: List[List[Document]],
    k: int = 60,
    top_n: int = 5
) -> List[Document]:
    """
    Reciprocal Rank Fusion (RRF) - combines multiple ranked lists.
    
    Score = sum(1 / (k + rank_i)) for each list
    
    Args:
        result_lists: List of ranked document lists from different retrievers
        k: RRF constant (typically 60)
        top_n: Number of final results to return
    
    Returns:
        Fused and re-ranked documents
    """
    doc_scores: Dict[str, float] = {}
    doc_map: Dict[str, Document] = {}  # Store document by content hash

    for results in result_lists:
        for rank, doc in enumerate(results, 1):
            # Use content as key (in practice, use doc.id or hash)
            key = doc.page_content[:200]  # Truncate for key
            score = 1.0 / (k + rank)
            
            if key in doc_scores:
                doc_scores[key] += score
            else:
                doc_scores[key] = score
                doc_map[key] = doc

    # Sort by combined score
    sorted_docs = sorted(doc_scores.items(), key=lambda x: x[1], reverse=True)
    
    return [doc_map[key] for key, _ in sorted_docs[:top_n]]


class HybridRAG:
    """Production-ready Hybrid RAG with RRF fusion."""
    
    def __init__(
        self,
        documents: List[Document],
        embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2",
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        dense_k: int = 10,
        sparse_k: int = 10,
        rrf_k: int = 60
    ):
        self.dense_k = dense_k
        self.sparse_k = sparse_k
        self.rrf_k = rrf_k
        
        # Split documents
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
        self.splits = splitter.split_documents(documents)
        
        # Dense: FAISS
        embeddings = HuggingFaceEmbeddings(model_name=embedding_model)
        self.vectorstore = FAISS.from_documents(self.splits, embeddings)
        
        # Sparse: BM25
        self.bm25 = BM25Retriever.from_documents(self.splits)
        self.bm25.k = sparse_k
    
    def retrieve(self, query: str, top_n: int = 5) -> List[Document]:
        """Retrieve using hybrid RRF fusion."""
        # Get candidates from both retrievers (more than needed for fusion)
        dense_results = self.vectorstore.similarity_search(query, k=self.dense_k)
        sparse_results = self.bm25.invoke(query)
        
        # Fuse with RRF
        fused = reciprocal_rank_fusion(
            [dense_results, sparse_results],
            k=self.rrf_k,
            top_n=top_n
        )
        return fused
    
    def retrieve_with_scores(self, query: str, top_n: int = 5) -> List[Dict[str, Any]]:
        """Retrieve with individual scores for debugging."""
        dense_results = self.vectorstore.similarity_search_with_score(query, k=self.dense_k)
        sparse_results = self.bm25.invoke(query)
        
        # Convert to uniform format
        dense_list = [doc for doc, _ in dense_results]
        sparse_list = sparse_results
        
        fused = reciprocal_rank_fusion(
            [dense_list, sparse_list],
            k=self.rrf_k,
            top_n=top_n
        )
        
        # Add scores for inspection
        results = []
        for doc in fused:
            dense_score = next(
                (score for d, score in dense_results if d.page_content[:200] == doc.page_content[:200]),
                None
            )
            sparse_rank = next(
                (i for i, d in enumerate(sparse_list, 1) if d.page_content[:200] == doc.page_content[:200]),
                None
            )
            results.append({
                "document": doc,
                "dense_score": dense_score,
                "sparse_rank": sparse_rank,
                "rrf_score": 1.0 / (self.rrf_k + (dense_results.index(next((d for d, _ in dense_results if d.page_content[:200] == doc.page_content[:200]), (None, 0)))[0]) + 1) if dense_score else 0
                           + 1.0 / (self.rrf_k + (sparse_rank or 100))
            })
        return results


# Example usage
if __name__ == "__main__":
    # Sample docs
    docs = [
        Document(page_content="Patient with acute STEMI treated with primary PCI. Door-to-balloon time 42 minutes. Aspirin, ticagrelor, atorvastatin prescribed.", metadata={"id": "1"}),
        Document(page_content="NSTEMI protocol: Risk stratification with GRACE score. Early invasive strategy if high risk. Dual antiplatelet therapy for 12 months.", metadata={"id": "2"}),
        Document(page_content="Heart failure with reduced EF: GDMT includes ACEi/ARB/ARNI, beta-blocker, MRA, SGLT2i. Target doses per guideline.", metadata={"id": "3"}),
        Document(page_content="Atrial fibrillation anticoagulation: CHA2DS2-VASc score guides DOAC selection. Apixaban 5mg BID preferred for most.", metadata={"id": "4"}),
        Document(page_content="Hypertensive emergency: IV nicardipine/labetalol. Target MAP reduction 20-25% in first hour. Avoid precipitous drops.", metadata={"id": "5"}),
    ]
    
    # Initialize
    rag = HybridRAG(docs)
    
    # Test queries
    queries = [
        "STEMI PCI door to balloon time",
        "NSTEMI GRACE score invasive strategy",
        "heart failure GDMT four pillars",
        "atrial fibrillation CHA2DS2-VASc DOAC",
        "hypertensive emergency nicardipine dosing",
    ]
    
    for query in queries:
        print(f"\n{'='*60}")
        print(f"Query: {query}")
        print(f"{'='*60}")
        
        results = rag.retrieve(query, top_n=3)
        for i, doc in enumerate(results, 1):
            print(f"  {i}. [{doc.metadata['id']}] {doc.page_content[:120]}...")