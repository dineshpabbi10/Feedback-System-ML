def preprocess_review(sentence):
    result=re.sub(r'\d+','',sentence)
    table = str.maketrans({key: None for key in string.punctuation})
    result_new=result.translate(table)
    result_new=result_new.strip()
    tokens=word_tokenize(result_new)
    stop_words=set(stopwords.words('english'))
    final=[j for j in tokens if not j in stop_words]
    temp=' '.join(final)
    return temp

def keywords(review):
        rake=Rake()
        rake.extract_keywords_from_text(review)
        keys=rake.get_word_degrees()
        return list(keys.keys())


def prediction_lstm(sentence):
        final=[]
        loaded_model=pickle.load(open('lstmModel0.1.pkl','rb'))
        token=pickle.load(open('lstmToken.pkl','rb'))
        sen=token.texts_to_sequences(sentence)
        padded_docs = pad_sequences(sen, maxlen=38, padding='post')
        proba=loaded_model.predict(padded_docs)
        result=np.argmax(proba)
        if result==0:
                final.append(-1)
        if result==1:
                final.append(0)
        if result==2:
                final.append(1)
        # K.clear_session()
        # loaded_model=pickle.load(open('lstmModel0.1.pkl','rb'))
        # proba=loaded_model.predict(padded_docs)
        final.append(proba[0][0]*100)
        final.append(proba[0][1]*100)
        final.append(proba[0][2]*100)
        K.clear_session()
        return final


@app.route('/lstmresult',methods=['GET','POST'])

def lstm_result():
    if(request.method=='POST' or request.method=='GET'):
        review=request.args.get('review')
        # # sentence=request.form.to_dict()
        # sentence=list(sentence.values())
        keyyy=keywords(review)
        result=prediction_lstm([review])
        sentiment=result[0]
        sentimentresult=''
        if(sentiment==-1):
            sentimentresult='Negative'
        elif(sentiment==0):
            sentimentresult='Neutral'
        elif(sentiment==1):
            sentimentresult='Positive'
        
        mydict={"Sent":sentimentresult,"Keywords":keyyy} 

        return flask.jsonify(mydict)

if (__name__=='__main__'):
	port = int(os.environ.get("PORT", 5000))
	app.run(debug=True, port=port)
