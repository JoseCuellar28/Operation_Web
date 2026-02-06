#!/usr/bin/env python3
"""
Inspect Personal API to see available job positions (tipo field)
"""
import requests
import json
from collections import Counter

API_URL = "http://localhost:5000/api/personal"

def inspect_tipos():
    """Query API and analyze tipo values"""
    try:
        print(f"🔍 Consultando API: {API_URL}\n")
        
        response = requests.get(API_URL, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        print(f"✅ Obtenidos {len(data)} registros\n")
        
        # Extract all tipo values
        tipos = [emp.get('tipo', 'NULL') for emp in data if emp.get('tipo')]
        
        # Count occurrences
        tipo_counts = Counter(tipos)
        
        print("=" * 60)
        print("VALORES DISPONIBLES EN CAMPO 'tipo' (Cargos/Puestos)")
        print("=" * 60)
        print(f"{'Tipo':<30} {'Cantidad':<10}")
        print("-" * 60)
        
        for tipo, count in tipo_counts.most_common():
            print(f"{tipo:<30} {count:<10}")
        
        print("-" * 60)
        print(f"\nTotal de tipos distintos: {len(tipo_counts)}")
        print(f"Total de registros: {len(data)}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conexión: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    inspect_tipos()
