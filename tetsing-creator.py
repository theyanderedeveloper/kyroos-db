import os
import random
import string

BASE_DIR = "/kyroos-db/files/"

ARCHS = ["x86_64", "i386", "i486", "arm7", "arm8"]

def random_string(length=2):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def random_version():
    return f"{random.randint(0,9)}.{random.randint(0,9)}.{random.randint(0,9)}"

def create_random_files(min_files=99999, max_files=99999):
    num_files = random.randint(min_files, max_files)

    for _ in range(num_files):
        r_str = random_string()
        arch = random.choice(ARCHS)
        version = random_version()

        dir_path = os.path.join(BASE_DIR, r_str, arch)
        os.makedirs(dir_path, exist_ok=True)

        file_name = f"{version}.kpkg"
        file_path = os.path.join(dir_path, file_name)

        # Create empty file (or add dummy content)
        with open(file_path, "w") as f:
            f.write("test package content\n")

    print(f"Created {num_files} files.")

if __name__ == "__main__":
    create_random_files()