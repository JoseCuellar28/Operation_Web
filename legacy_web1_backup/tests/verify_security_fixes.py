import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import json

# Add etl-service to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../etl-service')))

from server import app

class TestSecurityFixes(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    @patch('server.procesar_archivo')
    def test_api_analyze_exception_handling(self, mock_procesar):
        # Arrange
        mock_procesar.side_effect = Exception("Sensitive Database Info: Connection Failed")
        
        # Act
        response = self.app.post('/api/analyze', json={'archivo': 'test.xlsx'})
        
        # Assert
        self.assertEqual(response.status_code, 500)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertEqual(data['error'], "Error interno al analizar archivo")
        # Critical: Ensure sensitive info is NOT in the response
        self.assertNotIn("Sensitive Database Info", str(response.data))

    @patch('server.procesar_archivo')
    @patch('server.load_staging')
    def test_api_load_staging_exception_handling(self, mock_load, mock_procesar):
        # Arrange
        mock_procesar.return_value = {"resumen": {}}
        mock_load.side_effect = Exception("Sensitive Staging Error")
        
        # Act
        response = self.app.post('/api/load-staging', json={'archivo': 'test.xlsx'})
        
        # Assert
        self.assertEqual(response.status_code, 500)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertEqual(data['error'], "Error interno al cargar staging")
        self.assertNotIn("Sensitive Staging Error", str(response.data))

    @patch('server.deploy_sql')
    def test_api_deploy_sql_exception_handling(self, mock_deploy):
        # Arrange
        mock_deploy.side_effect = Exception("Sensitive SQL Error")
        
        # Act
        response = self.app.post('/api/deploy-sql')
        
        # Assert
        self.assertEqual(response.status_code, 500)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertEqual(data['error'], "Error interno al desplegar SQL")
        self.assertNotIn("Sensitive SQL Error", str(response.data))

    @patch('server.tables')
    def test_api_tables_exception_handling(self, mock_tables):
        # Arrange
        mock_tables.side_effect = Exception("Sensitive Table Schema Error")
        
        # Act
        response = self.app.get('/api/tables')
        
        # Assert
        self.assertEqual(response.status_code, 500)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertEqual(data['error'], "Error interno al listar tablas")
        self.assertNotIn("Sensitive Table Schema Error", str(response.data))

if __name__ == '__main__':
    unittest.main()
