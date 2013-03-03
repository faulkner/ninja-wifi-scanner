"""Convert airodump csv to json"""
import json
import argparse
# is there seriously no way to get airodump to just export stations?
# TODO: use streams


def parse(filename):
    with open(filename) as f:
        # airodump throws APs and stations in the same file; we only need the stations
        stations = f.read().split('\r\n\r\n')[1]

    for line in stations.split('\r\n')[1:]:
        yield [cell.strip() for cell in line.split(',')]


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('-i', default='dump.csv', help='csv input file')
    parser.add_argument('-o', default='dump.json', help='json output file')
    (opt, args) = parser.parse_known_args()

    keys = ['mac', 'first_seen', 'last_seen', 'power', 'packets', 'BSSID', 'probed_ESSIDs']
    with open(opt.o, 'w+') as f:
        json.dump([dict(zip(keys, l)) for l in parse(opt.i)], f, ensure_ascii=False)
