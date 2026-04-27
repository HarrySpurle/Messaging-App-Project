from sympy import randprime

def RSA_generate_keys(bits: int =512):
    p = randprime(2**(bits-1), 2**bits)
    q = randprime(2**(bits-1), 2**bits)

    n = p*q

    phi = (p-1)*(q-1)

    e = 65537 # standard in RSA, is prime and its binary has only 2 bits meaning comp is fast

    d = pow(e, -1, phi) # used to decrypt

    # ciphertext = plaintext ^ e mod n
    # plaintext = ciphertext ^ d mod n
    # converts message to number and performs operation using large numbers consisting of 2 primes which is infesible to factorise

    return (e,n), (d, n) # public private



def RSA_encrypt(plaintext: str, publicKey: tuple):
    e, n = publicKey
    message_int = int.from_bytes(plaintext.encode(), 'big')
    return pow(message_int, e, n)

def RSA_decrypt(ciphertext: int, privateKey: tuple):
    d, n = privateKey
    message_int = pow(ciphertext, d, n)
    return message_int.to_bytes((message_int.bit_length() + 7) // 8, 'big').decode()

