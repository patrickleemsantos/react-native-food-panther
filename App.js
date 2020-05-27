import React, {
  useState,
  useEffect
} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const logo = require('./assets/images/panther.png');
const star = require('./assets/images/ic-star-sm.png');

const App = () => {
  let onEndReachedCalledDuringMomentum = false;

  const [isLoading, setIsLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [restaurants, setRestaurants] = useState([]);

  const restaurantsRef = firestore().collection('restaurants');

  useEffect(() => {
    getRestaurants();
  }, []);

  getRestaurants = async () => {
    setIsLoading(true);

    const snapshot = await restaurantsRef.orderBy('id').limit(3).get();

    if (!snapshot.empty) {
      let newRestaurants = [];

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

      for (let i = 0; i < snapshot.docs.length; i++) {
        newRestaurants.push(snapshot.docs[i].data());
      }

      setRestaurants(newRestaurants);
    } else {
      setLastDoc(null);
    }

    setIsLoading(false);
  }

  getMore = async () => {
    if (lastDoc) {
      setIsMoreLoading(true);

      setTimeout(async() => {
      let snapshot = await restaurantsRef.orderBy('id').startAfter(lastDoc.data().id).limit(3).get();

      if (!snapshot.empty) {
        let newRestaurants = restaurants;

        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

        for(let i = 0; i < snapshot.docs.length; i++) {
          newRestaurants.push(snapshot.docs[i].data());
        }

        setRestaurants(newRestaurants);
        if (snapshot.docs.length < 3) setLastDoc(null);
      } else {
        setLastDoc(null);
      }

      setIsMoreLoading(false);
    }, 1000);
    }

    onEndReachedCalledDuringMomentum = true;
  }

  renderList = ({ name, photo, budget, tags, rating, isNew }) => {
    return (
      <View style={styles.list}>
        <Image source={{ uri: photo }} style={styles.listImage} />
        <View style={styles.listingRatingContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={star} style={{ marginRight: 5 }}/>
              <Text style={styles.rating}><Text style={{ fontWeight: 'bold' }}>{rating}</Text>/5</Text>
          </View>
        </View>
        <View style={styles.budgetTagsContainer}>
          <Text style={[styles.budgetTagsText, budget <= 3 && {color: '#276FBF'}]}>$</Text>
          <Text style={[styles.budgetTagsText, budget <= 3 && budget !== 1 && {color: '#276FBF'}]}>$</Text>
          <Text style={[styles.budgetTagsText, budget === 3 && {color: '#276FBF'}]}>$</Text>
          <View>
            <Text numberOfLines={1} style={styles.budgetTagsText}>, {tags.join()}</Text>
          </View>
        </View>
        {isNew && (
          <View style={styles.newContainer}>
            <Text style={styles.newText}>NEW</Text>
          </View>
        )}
      </View>
    )
  }

  onRefresh = () => {
    setTimeout(() => {
      getRestaurants();
    }, 1000);
  }

  renderFooter = () => {
    if (!isMoreLoading) return true;
    
    return (
      <ActivityIndicator
          size='large'
          color={'#D83E64'}
          style={{ marginBottom: 10 }}
      />
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Image source={logo} style={styles.headerLogo} />
        <Text style={styles.headerText}>foodpanther</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Popular restaurants</Text>
        <FlatList 
          data={restaurants}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => renderList(item)}
          ListFooterComponent={renderFooter}
          refreshControl={
              <RefreshControl
                  refreshing={isLoading}
                  onRefresh={onRefresh}
              />
          }
          initialNumToRender={3}
          onEndReachedThreshold={0.1}
          onMomentumScrollBegin = {() => {onEndReachedCalledDuringMomentum = false;}}
          onEndReached = {() => {
              if (!onEndReachedCalledDuringMomentum && !isMoreLoading) {
                getMore();
              }
            }
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
    paddingTop: 20
  },
  headerLogo: {
    width: 30,
    height: 30,
    marginRight: 10
  },
  headerText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#D83E64'
  },
  title: {
    fontWeight: '300',
    fontSize: 26,
    marginVertical: 10,
    marginLeft: 10,
    color: '#333333'
  },
  list: {
    width: '100%',
    flexDirection: 'column',
    paddingHorizontal: 10,
    marginBottom: 20
  },
  listImage: {
    width: '100%',
    height: 200
  },
  listingRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10
  },
  name: {
    fontWeight: '500',
    fontSize: 17, 
    color: '#333333'
  },
  rating: {
    fontSize: 13,
    fontWeight: '100',
    color: '#333333'
  },
  budgetTagsContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center'
  },
  budgetTagsText: {
    fontWeight: '100',
    color: '#333333',
    fontSize: 15
  },
  newContainer: {
    position: 'absolute',
    top: 20,
    left: 10,
    backgroundColor: '#D83E64',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  newText: {
    color: '#FFFFFF',
    fontWeight: '500'
  }
});

export default App;
