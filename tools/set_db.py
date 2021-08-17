import sys
from dotenv import load_dotenv
import os

load_dotenv()

DEV_URI = os.getenv('DEV_URI')
PROD_URI = os.getenv('PROD_URI')

env_type = sys.argv[1]
if (env_type != 'dev' and env_type != 'prod'):
    print('\nPlease specify environment type in argument. \npython set_db.py [\'dev\' | \'prod\']\n')
    quit()

try:
    dotenv_r = open('../.env', 'r')
    lines = dotenv_r.read().split('\n')
    for i in range(len(lines)):
        if (lines[i].find('DATABASE_URI=') == 0):
            lines[i] = DEV_URI if (env_type == 'dev') else PROD_URI
            print(f"Successfully switched to {env_type} database")
    dotenv_w = open('../.env', 'w')
    dotenv_w.write('\n'.join(lines))

finally:
    dotenv_r.close()
    dotenv_w.close()
