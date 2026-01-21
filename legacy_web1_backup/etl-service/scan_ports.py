import socket

def check_port(host, port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(1)
    result = sock.connect_ex((host, port))
    sock.close()
    return result == 0

ports = [1433, 1434, 5051]
hosts = ['127.0.0.1', 'localhost']

print("Scanning ports...")
for host in hosts:
    for port in ports:
        is_open = check_port(host, port)
        print(f"{host}:{port} is {'OPEN' if is_open else 'CLOSED'}")
