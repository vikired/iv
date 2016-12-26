
# calculate yrank
getyrank=function(pdata)
{
  yrank=rank(pdata$y,na.last=TRUE, ties.method=c("average"))
  pdata=cbind(pdata,yrank)
  return(pdata)
}

#calculate x rank
getxrank=function(pdata)
{
  newdata=pdata[0,]
  for(rank in unique(pdata$yrank))
  {
    ydata=subset(pdata, yrank==rank)
    result=rank(ydata$x,na.last=TRUE, ties.method=c("average"))
    ydata=cbind(ydata,xrank=result)
    newdata=rbind(newdata,ydata)
  }
  return(newdata)
}

#add outcome
writeOutcome=function(pdata)
{
  pdata=cbind(pdata,oName=numeric(length(pdata$y)))
  pdata=cbind(pdata,oBillNo=numeric(length(pdata$y)))
  pdata=cbind(pdata,oBillDate=numeric(length(pdata$y)))
  pdata=cbind(pdata,oAmount=numeric(length(pdata$y)))
  return(pdata)
}

#decodeText
decodeText=function(pdata)
{
  index=which(colnames(pdata)=="text")
  cleanVect=sapply(pdata$text,URLdecode)
  cleanText=sapply(cleanVect,toString)
  pdata=cbind(pdata,cleanText)
  return(pdata)
}
#Ngram
applyNgram=function(pdata)
{
  library("tm","NLP")
  ordered=pdata[order(pdata$y,pdata$x),]
  ngramtext=c(c(""),vapply(ngrams(ordered$cleanText, 3L), paste, "", collapse = " "),c(""))
  pdata=cbind(ordered,ngramtext)
  return(pdata)
}

#bagofwordsonNgram
applybagofwords=function(pdata)
{
  prep_fun = tolower
  tok_fun = word_tokenizer
  print(pdata$REDID)
  pdata$ngramtext=sapply(pdata$ngramtext,toString)
  sapply(pdata,typeof)
  it_pdata=itoken(pdata$ngramtext,preprocessor=tolower,tokenizer=word_tokenizer,ids=pdata$REDID,progressbar=FALSE)
  
  vocab = create_vocabulary(it_pdata)
  
  vectorizer = vocab_vectorizer(vocab)
  
  dtm_train = create_dtm(it_pdata, vectorizer)
  
  identical(rownames(dtm_train),pdata$REDID)
  
  mydtm_df=data.frame(as.matrix(dtm_train))
  
  pdata=cbind(pdata,mydtm_df)
  return(pdata)
}

#isDigit
findIsDigit=function(pdata)
{
   isDigit=suppressWarnings(!is.na(as.numeric(gsub(",", "", pdata$cleanText))))
   pdata=cbind(pdata,isDigit)
   return(pdata)
}