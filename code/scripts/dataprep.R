source("D:/Proto/Invoice/code/scripts/dataprepfunction.R")

cleaninvoicecsv=function(filename)
{

  rm(raw,pdata,newdata,getyrank,getxrank,decodeText,applyNgram,applybagofwords,writeOutcome)
  path="D:/Proto/Invoice/data";
  #D:/Proto/Invoice/data/shalaka.csv
  library(readr,text2vec)
  raw <- read_csv(file.path(path,filename))
  raw$REDID<-seq.int(nrow(raw))
  
  pdata <- decodeText(raw)
  
  pdata <- getyrank(pdata)
  pdata <- getxrank(pdata)
  pdata <- applyNgram(pdata)
  pdata <- applybagofwords(pdata)
  pdata <- findIsDigit(pdata)
  
  pdata=writeOutcome(pdata)
  
  write.csv(pdata, file = (file.path(path,"cleaned",filename)))
  return(pdata)
}

