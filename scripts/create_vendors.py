#!/usr/bin/env python
"""Dump http://standards.ieee.org/develop/regauth/oui/oui.txt to json"""
import os
import json
import subprocess


def fetch_lines():
    """grab MAC list from IEEE"""
    filename = 'oui.txt'
    # the file is 2.7MB, so only grab a copy if we don't have it already
    if not os.path.exists(filename):
        subprocess.check_call(['wget', 'http://standards.ieee.org/develop/regauth/oui/oui.txt'])
    with open(filename) as f:
        return f.readlines()


def main():
    results = {}
    for line in fetch_lines():
        # using the 'hex' line since it enumerates private MACs better than the 'base 16' line
        if '(hex)' not in line:
            continue
        prefix, vendor = [s.strip() for s in line.split('(hex)')]
        results[prefix.replace('-', '')] = vendor

    with open('vendors.json', 'w+') as f:
        json.dump(results, f)


if __name__ == '__main__':
    main()
