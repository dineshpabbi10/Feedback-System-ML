from keras.layers import Dense,Conv1D,MaxPool1D,Embedding,Flatten,Dropout,GRU,LSTM, Bidirectional
from keras.preprocessing.text import Tokenizer
from keras.models import Sequential
from keras.preprocessing.sequence import pad_sequences
from sklearn.preprocessing import OneHotEncoder
from keras.optimizers import Adam
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import LabelEncoder
import numpy
import pandas
from keras.models import Sequential
from keras.layers import Dense
from keras.wrappers.scikit_learn import KerasClassifier
from keras.utils import np_utils
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import KFold
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline

reviews_array=np.array(df.Reviews)
sentiment_array=np.array(df.Sentiment)

# encode class values as integers
encoder = LabelEncoder()
encoder.fit(sentiment_array)
encoded_Y = encoder.transform(sentiment_array)
# convert integers to dummy variables (i.e. one hot encoded)
dummy_y = np_utils.to_categorical(encoded_Y)

token=Tokenizer()
token.fit_on_texts(reviews_array) 
vocab_size=len(token.word_index) +1
print(vocab_size)
l = 0
for i in reviews_array:
  l += len(i)
  
avg_length = l/len(reviews_array)
review_training = [x[:int(avg_length)] for x in reviews_array]

encoded = token.texts_to_sequences(reviews_array)
l = []
for i in encoded:
  l.append(len(i))

padded_docs = pad_sequences(encoded, maxlen=38, padding='post')
n_model1 = Sequential()
n_model1.add(Embedding(48802,64,input_length=38))
n_model1.add(LSTM(64, activation='tanh', recurrent_activation='hard_sigmoid', use_bias=True, kernel_initializer='glorot_uniform', recurrent_initializer='orthogonal', bias_initializer='zeros', unit_forget_bias=True, kernel_regularizer=None, recurrent_regularizer=None, bias_regularizer=None, activity_regularizer=None, kernel_constraint=None, recurrent_constraint=None, bias_constraint=None, dropout=0.0, recurrent_dropout=0.0, implementation=1, return_sequences=True, return_state=False, go_backwards=False, stateful=False, unroll=False))
n_model1.add(Dropout(0.5))
n_model1.add(LSTM(64,return_sequences=False))
n_model1.add(Dropout(0.5))
model.add(Dense(8, input_dim=1, activation='relu'))
n_model1.add(Dense(3, activation='softmax'))
n_model1.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
hist = n_model1.fit(padded_docs,dummy_y,epochs=5,batch_size=100,validation_split=0.2)
