#include <iostream>
using namespace std;

double predict(double study, double sleep) {
    // weights copied from training screen
    double w1 = 4.98326;
    double w2 = 2.99978;
    double b  = 4.04724;

    return w1 * study + w2 * sleep + b;
}

int main() {
    double study, sleep;

    cout << "Enter study hours: "; cin >> study;
    cout << "Enter sleep hours: "; cin >> sleep;

    cout << "Predicted marks: " << predict(study, sleep) << endl;

    return 0;
}