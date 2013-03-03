#!/usr/bin/env python
"""Convert airodump csv to json"""
import json
import argparse
# is there seriously no way to get airodump to just export stations?
# TODO: use streams


def parse(filename):
    with open(filename) as f:
        # airodump throws APs and stations in the same file; we only need the stations
        stations = f.read().split('\r\n\r\n')[1]

    keys = ['mac', 'first_seen', 'last_seen', 'power', 'packets', 'BSSID', 'probed_ESSIDs']
    for line in stations.split('\r\n')[1:]:
        yield dict(zip(keys, [cell.strip() for cell in line.split(',')]))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('-i', default='dump.csv', help='csv input file')
    parser.add_argument('-o', default='dump.json', help='json output file')
    (opt, args) = parser.parse_known_args()

    try:
        with open('vendors.json') as f:
            vendors = json.load(f)
    except IOError:
        raise Exception('Could not load vendor list.  Try running create_vendors.py first.')

    with open(opt.o, 'w+') as f:
        rows = []
        for row in parse(opt.i):
            # mash in vendor details
            row['vendor'] = vendors.get(row['mac'][0:8].replace(':', ''))
            rows.append(row)
        json.dump(rows, f, ensure_ascii=False)
