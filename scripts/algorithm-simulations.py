# user gets better at problems the more he sees them recently. last 100 looks considered.

from collections import deque
from random import random

import matplotlib.pyplot as plt
import numpy as np

def simulate_user(letter, past):
    past.append(letter);
    return (0.5 + 0.45*(past.count(letter) / 10))*random() > 0.5

# A represents fully learned, E represents unseen.
def simulate_algorithm(dist):
    # numbers of flashcards in each category
    A, B, C, D, E = dist; 

    # A goes fro

    if (A + B + C + D) < 10:
        Ap = 0
        Bp = 0
        Cp = 0
        Dp = 0
        Ep = 1

    else:

        Ap = (0.40 + 0.35*(A / (A + B + C + D + E)))*(A > 0)
        Ep = 0.05*(E > 0)
        BCDp = 1 - Ap - Ep
        Bp = (BCDp / 3)*(B > 0)
        Cp = (BCDp / 3)*(C > 0)
        Dp = (BCDp / 3)*(D > 0)

    total = Ap + Bp + Cp + Dp + Ep

    r = random()*total

    if r < Ap:
        return "A"
    if r < Ap + Bp:
        return "B"
    if r < Ap + Bp + Cp:
        return "C"
    if r < Ap + Bp + Cp + Dp:
        return "D"
    return "E"

def run_simul(n, k, p):
    dist = [(0, 0, 0, 0, n)]
    past = deque(maxlen=p)

    for _ in range(k):
        letter = simulate_algorithm(dist[-1])
        print(letter, dist[-1])
        # terrible way to do this.
        A, B, C, D, E = dist[-1]
        if simulate_user(letter, past):
            if letter == "A":
                dist.append((A, B, C, D, E))
            elif letter == "B":
                dist.append((A+1, B-1, C, D, E))
            elif letter == "C":
                dist.append((A, B+1, C-1, D, E))
            elif letter == "D":
                dist.append((A, B, C+1, D-1, E))
            elif letter == "E":
                dist.append((A, B, C, D+1, E-1))
        else:
            if letter == "A":
                dist.append((A-1, B+1, C, D, E))
            elif letter == "B":
                dist.append((A, B-1, C+1, D, E))
            elif letter == "C":
                dist.append((A, B, C-1, D+1, E))
            elif letter == "D":
                dist.append((A, B, C, D-1, E+1))
            elif letter == "E":
                dist.append((A, B, C, D, E))

    x = np.array(range(len(dist)))
    yA = np.array([d[0] for d in dist])
    yB = np.array([d[0] + d[1] for d in dist])
    yC = np.array([d[0] + d[1] + d[2] for d in dist])
    yD = np.array([d[0] + d[1] + d[2] + d[3] for d in dist])
    yE = np.array([d[0] + d[1] + d[2] + d[3] + d[4] for d in dist])

    #fig, ax = plt.subplots()  
    plt.plot(x, yA, label="A")
    plt.plot(x, yB, label="<=B")
    plt.plot(x, yC, label="<=C")
    plt.plot(x, yD, label="<=D")
    plt.plot(x, yE, label="<=E")
    plt.legend()

run_simul(100, 2000, 1000)
print("done")
plt.show()
    # A : correct
    
    # E: never seen

    # A should go from: 40 <A = 0%> to 75 > <A = 100%>

    # E : 5 %

    # B, C, D:  1 : 2 : 3
